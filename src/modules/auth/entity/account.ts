import {
  Entity,
  ForbiddenError,
  Relations,
  remult,
  repo,
} from "remult";

import * as v from "valibot";
import { User } from "./user";
import { UIPermissions } from "@/services/iam";
import { vFields } from "@/utils/fields";

export enum ProviderId {
  Google = "google",
  Twitter = "twitter",
  Facebook = "facebook",
  Credentials = "credentials",
}

export const accountDto = v.object({
  id: v.optional(v.string()),
  accountId: v.string(),
  providerId: v.enum(ProviderId),
  userId: v.string(),
  accessToken: v.optional(v.string()),
  refreshToken: v.optional(v.string()),
  idToken: v.optional(v.string()),
  accessTokenExpiresAt: v.optional(v.date()),
  refreshTokenExpiresAt: v.optional(v.date()),
  scope: v.optional(v.string()),
  password: v.optional(v.string()),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<Account>("account", {
  allowApiRead: true,
  allowApiUpdate: (e, c) => c?.isAllowed("admin") || c?.user?.id === e?.userId,
  allowApiDelete: (e, c) => c?.isAllowed("admin") || c?.user?.id === e?.userId,
  apiPrefilter: () => Account.filter(),
})
export class Account {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    input: accountDto.entries.accountId,
  })
  accountId!: string;

  @vFields.string({
    input: accountDto.entries.providerId,
  })
  providerId!: ProviderId;

  @vFields.string({
    input: accountDto.entries.userId,
  })
  userId!: string;

  @Relations.toOne(() => User, "userId")
  user!: User;

  @vFields.string({
    input: accountDto.entries.accessToken,
  })
  accessToken?: string;

  @vFields.string({
    input: accountDto.entries.refreshToken,
  })
  refreshToken?: string;

  @vFields.string({
    input: accountDto.entries.idToken,
  })
  idToken?: string;

  @vFields.date({
    input: accountDto.entries.accessTokenExpiresAt,
  })
  accessTokenExpiresAt?: Date;

  @vFields.date({
    input: accountDto.entries.refreshTokenExpiresAt,
  })
  refreshTokenExpiresAt?: Date;

  @vFields.string({
    input: accountDto.entries.scope,
  })
  scope?: string;

  @vFields.string({
    includeInApi: false,
  })
  passwordHash!: string;

  @vFields.string<Account>({
    input: accountDto.entries.password,
    serverExpression: () => "********",
    saving: async (account) => {
      if (account.password) {
        account.passwordHash = await Account.hash(account.password);
      }
    },
  })
  password!: string;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;

  static filter = () => {
    const user = remult.user;
    if (!user)
      throw new ForbiddenError("Unauthorized");
    if (user.roles?.includes("admin"))
      return {};
    return { userId: user.id };
  };

  static hash = async (password: string) => password;
}

export const accountRepo = repo(Account);
export const hasAccountPerm = UIPermissions<Account>(accountRepo);

import {
  Entity,
  ForbiddenError,
  Relations,
  remult,
  repo,
} from "remult";

import { Account } from "./account";
import { Passkey } from "./passkey";
import { Session } from "./session";
import { vFields } from "@/utils/fields";
import { UIPermissions } from "@/services/iam";
import { Business } from "$modules/org";

import * as v from "valibot";

export const userDto = v.object({
  id: v.optional(v.string()),
  email: v.string(),
  name: v.optional(v.string()),
  username: v.optional(v.string()),
  avatar: v.optional(v.string()),
  emailVerified: v.optional(v.boolean()),
  twoFactorVerified: v.optional(v.boolean()),
  roles: v.optional(v.array(v.string())),
  recoveryCode: v.optional(v.string()),
  banned: v.optional(v.boolean()),
  banReason: v.optional(v.string()),
  banExpires: v.optional(v.date()),
  activeShopId: v.optional(v.string()),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<User>("user", {
  allowApiRead: true,
  allowApiUpdate: (e, c) => c?.isAllowed("admin") || c?.user?.id === e?.id,
  allowApiDelete: (e, c) => c?.isAllowed("admin") || c?.user?.id === e?.id,
  apiPrefilter: () => User.filter(),
})
export class User {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    unique: true,
    valueConverter: {
      toDb: x => (x ? x?.toLowerCase() : ""),
    },
    input: userDto.entries.email,
  })
  email!: string;

  @vFields.string({ input: userDto.entries.name })
  name?: string;

  @vFields.string({ input: userDto.entries.username })
  username?: string;

  @vFields.string({ input: userDto.entries.avatar })
  avatar?: string;

  @vFields.boolean({
    defaultValue: () => false,
    input: userDto.entries.emailVerified,
  })
  emailVerified!: boolean;

  @vFields.boolean({
    defaultValue: () => false,
  })
  twoFactorVerified!: boolean;

  @vFields.json<User, string[]>({
    valueConverter: {
      toDb: (x: string[] | undefined) => x?.join(","),
      fromDb: (x: string | undefined) => x?.split(",") ?? [],
    },
  })
  roles: string[] = [];

  @vFields.string({ input: userDto.entries.recoveryCode })
  recoveryCode?: string;

  @vFields.boolean({
    defaultValue: () => false,
    input: userDto.entries.banned,
  })
  banned?: boolean;

  @vFields.string({ input: userDto.entries.banReason })
  banReason?: string;

  @vFields.date({ input: userDto.entries.banExpires })
  banExpires?: Date;

  @vFields.string({ input: userDto.entries.activeShopId })
  activeShopId?: string;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;

  @Relations.toMany(() => Session)
  sessions?: Session[];

  @Relations.toMany(() => Account)
  accounts?: Account[];

  @Relations.toMany(() => Passkey)
  passkeys?: Passkey[];

  @Relations.toMany(() => Business, {
    field: "ownerId",
  })
  businesses?: Business[];

  static filter = () => {
    const user = remult.user;
    if (!user)
      throw new ForbiddenError("Unauthorized");
    if (user.roles?.includes("admin"))
      return {};
    return { id: user.id };
  };
}

export const userRepo = repo(User);
export const hasUserPerm = UIPermissions<User>(userRepo);

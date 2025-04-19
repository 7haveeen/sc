import {
  Entity,
  ForbiddenError,
  Relations,
  remult,
  repo,
} from "remult";

import { vFields } from "@/utils/fields";
import * as v from "valibot";
import { User } from "./user";
import { UIPermissions } from "@/services/iam";

export const passkeyDto = v.object({
  id: v.optional(v.string()),
  credentialId: v.string(),
  name: v.optional(v.string()),
  publicKey: v.string(),
  userId: v.string(),
  counter: v.pipe(v.number(), v.integer()),
  deviceType: v.optional(v.string()),
  algorithm: v.optional(v.number()),
  transports: v.optional(v.string()),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<Passkey>("passkey", {
  allowApiRead: true,
  allowApiUpdate: (e, c) => c?.isAllowed("admin") || c?.user?.id === e?.userId,
  allowApiDelete: (e, c) => c?.isAllowed("admin") || c?.user?.id === e?.userId,
  apiPrefilter: () => Passkey.filter(),
})
export class Passkey {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    input: passkeyDto.entries.credentialId,
  })
  credentialId!: string;

  @vFields.string({
    defaultValue: () => "Default",
    input: passkeyDto.entries.name,
  })
  name!: string;

  @vFields.string({
    dbName: "public_key",
    input: passkeyDto.entries.publicKey,
  })
  publicKey!: string;

  @vFields.string({
    input: passkeyDto.entries.userId,
  })
  userId!: string;

  @Relations.toOne(() => User, "userId")
  user!: User;

  @vFields.integer({
    input: passkeyDto.entries.counter,
  })
  counter!: number;

  @vFields.string({
    input: passkeyDto.entries.deviceType,
  })
  deviceType!: string;

  @vFields.float({
    input: passkeyDto.entries.algorithm,
  })
  algorithm!: number;

  @vFields.string({
    input: passkeyDto.entries.transports,
  })
  transports?: string;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt!: Date;

  static filter = () => {
    const user = remult.user;
    if (!user)
      throw new ForbiddenError("Unauthorized");
    if (user.roles?.includes("admin"))
      return {};
    return { userId: user.id };
  };
}

export const passkeyRepo = repo(Passkey);
export const hasPasskeyPerm = UIPermissions<Passkey>(passkeyRepo);

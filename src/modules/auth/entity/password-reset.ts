import {
  Entity,
  Relations,
  repo,
} from "remult";
import { vFields } from "@/utils/fields";
import { UIPermissions } from "@/services/iam";
import * as v from "valibot";
import { User } from "./user";

export const passwordResetDto = v.object({
  id: v.optional(v.string()),
  userId: v.optional(v.string()),
  email: v.pipe(v.string(), v.email("Invalid email format")),
  token: v.string(),
  expiresAt: v.date(),
  emailVerified: v.boolean(),
  twoFactorVerified: v.boolean(),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<PasswordReset>("password_reset", {
  allowApiCrud: ["admin"],
})
export class PasswordReset {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    input: passwordResetDto.entries.userId,
    unique: true,
  })
  userId?: string;

  @Relations.toOne(() => User, { field: "userId" })
  user?: User;

  @vFields.string({
    input: passwordResetDto.entries.email,
  })
  email!: string;

  @vFields.string({
    input: passwordResetDto.entries.token,
  })
  token!: string;

  @vFields.date({
    input: passwordResetDto.entries.expiresAt,
  })
  expiresAt!: Date;

  @vFields.boolean({
    input: passwordResetDto.entries.emailVerified,
  })
  emailVerified!: boolean;

  @vFields.boolean({
    input: passwordResetDto.entries.twoFactorVerified,
  })
  twoFactorVerified!: boolean;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;
}

export const passwordResetRepo = repo(PasswordReset);
export const hasPasswordResetPerm = UIPermissions<PasswordReset>(passwordResetRepo);

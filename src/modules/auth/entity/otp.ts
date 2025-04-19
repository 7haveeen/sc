import {
  Entity,
  Relations,
  repo,
} from "remult";
import { vFields } from "@/utils/fields";
import { UIPermissions } from "@/services/iam";
import * as v from "valibot";

import { User } from "./user";

export enum OtpType {
  Join = "join",
  Auth = "auth",
  Reset = "reset",
}

export const otpDto = v.object({
  id: v.optional(v.string()),
  userId: v.string(),
  token: v.string(),
  type: v.enum(OtpType),
  expiresAt: v.date(),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity("otp", {
  allowApiCrud: ["admin"],
})
export class Otp {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    input: otpDto.entries.userId,
  })
  userId!: string;

  @Relations.toOne(() => User, "userId")
  user?: User;

  @vFields.string({
    input: otpDto.entries.token,
  })
  token!: string;

  @vFields.string({
    input: otpDto.entries.type,
  })
  type!: OtpType;

  @vFields.dateTime({
    input: otpDto.entries.expiresAt,
  })
  expiresAt!: Date;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;
}

export const otpRepo = repo(Otp);
export const hasOtpPerm = UIPermissions<Otp>(otpRepo);

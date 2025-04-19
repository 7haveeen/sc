import { Entity, Relations, repo } from "remult";
import { vFields } from "@/utils/fields";
import { UIPermissions } from "@/services/iam";
import { Business } from "./business";
import * as v from "valibot";

export const invitationDto = v.object({
  id: v.optional(v.string()),
  publicId: v.optional(v.string()),
  businessId: v.string(),
  email: v.string(),
  role: v.optional(v.string()),
  status: v.string(),
  expiresAt: v.date(),
  inviterId: v.string(),
});

@Entity<Invitation>("invitation", {
  allowApiRead: true,
  allowApiUpdate: ["admin"],
  allowApiDelete: ["admin"],
})
export class Invitation {
  @vFields.cuid()
  id!: string;

  @vFields.publicId("inv", 10)
  publicId!: string;

  @vFields.string({
    input: invitationDto.entries.businessId,
  })
  businessId!: string;

  @Relations.toOne(() => Business, "businessId")
  business!: Business;

  @vFields.string({
    input: invitationDto.entries.email,
  })
  email!: string;

  @vFields.string({
    input: invitationDto.entries.role,
  })
  role?: string;

  @vFields.string({
    input: invitationDto.entries.status,
  })
  status!: string;

  @vFields.date({
    input: invitationDto.entries.expiresAt,
  })
  expiresAt!: Date;

  @vFields.string({
    input: invitationDto.entries.inviterId,
  })
  inviterId!: string;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;
}

export const invitationRepo = repo(Invitation);
export const hasInvitationPerm = UIPermissions<Invitation>(invitationRepo);

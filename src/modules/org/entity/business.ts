import {
  Entity,
  ForbiddenError,
  Relations,
  remult,
  repo,
} from "remult";
import { vFields } from "@/utils/fields";
import { PermissionChecker as pc, UIPermissions } from "@/services/iam";
import * as v from "valibot";

import { Invitation } from "./invitation";
import { Shop } from "./shop";
import { User } from "$modules/auth";
import { vPhone } from "@/utils";

import type { Action } from "@/services/iam";

export enum VerificationStatus {
  Unverified = "unverified",
  Pending = "pending",
  Verified = "verified",
  Rejected = "rejected",
}

export enum BusinessType {
  Individual = "individual",
  Corporate = "corporate",
}

export const businessDto = v.object({
  id: v.optional(v.string()),
  publicId: v.optional(v.string()),
  name: v.pipe(
    v.string(),
    v.minLength(3, "Business name must be at least 3 characters long"),
    v.maxLength(30, "Business name must be at most 30 characters long"),
  ),
  type: v.enum(BusinessType),
  ownerId: v.string(),
  logo: v.optional(v.string()),
  phone: vPhone(),
  address: v.pipe(
    v.string(),
    v.minLength(5, "Address must be at least 5 characters long"),
    v.maxLength(50, "Address must be at most 50 characters long"),
  ),
  verificationStatus: v.optional(
    v.enum(VerificationStatus),
    VerificationStatus.Unverified,
  ),
  verificationData: v.optional(
    v.object({
      documents: v.array(v.string()),
      submittedAt: v.date(),
      reviewedAt: v.optional(v.date()),
      rejectionReason: v.optional(v.string()),
    }),
  ),
  allowMultipleShops: v.optional(v.boolean(), false),
  maxShops: v.optional(v.number(), 1),
  metadata: v.optional(v.record(v.string(), v.unknown())),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<Business>("business", {
  allowApiDelete: true,
  allowApiInsert: true,
  allowApiRead: () => Business.can("read"),
  allowApiUpdate: () => Business.can("update"),

  apiPrefilter: () => Business.filter(),

  saving: async (_, { isNew }) => {
    if (isNew)
      await Business.validateInsert();
  },
})
export class Business {
  @vFields.cuid()
  id!: string;

  @vFields.publicId("biz", 10)
  publicId!: string;

  @vFields.string({
    input: businessDto.entries.name,
    unique: true,
  })
  name!: string;

  @vFields.string({
    input: businessDto.entries.type,
  })
  type!: BusinessType;

  @vFields.string({
    input: businessDto.entries.ownerId,
  })
  ownerId!: string;

  @Relations.toOne(() => User, "ownerId")
  owner?: User;

  @vFields.string({
    input: businessDto.entries.logo,
  })
  logo?: string;

  @vFields.string<Business>({
    input: businessDto.entries.phone,
  })
  phone!: string;

  @vFields.string({
    input: businessDto.entries.address,
  })
  address!: string;

  @vFields.string({
    input: businessDto.entries.verificationStatus,
  })
  verificationStatus?: VerificationStatus;

  @vFields.json({
    input: businessDto.entries.verificationData,
  })
  verificationData?: {
    documents: string[];
    submittedAt: Date;
    reviewedAt?: Date;
    rejectionReason?: string;
  };

  @vFields.boolean({
    defaultValue: () => false,
    input: businessDto.entries.allowMultipleShops,
  })
  allowMultipleShops?: boolean;

  @vFields.integer({
    input: businessDto.entries.maxShops,
  })
  maxShops?: number;

  @vFields.json({
    input: businessDto.entries.metadata,
  })
  metadata?: Record<string, unknown>;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;

  @Relations.toMany(() => Shop)
  shops?: Shop[];

  @Relations.toMany(() => Invitation)
  invitations?: Invitation[];

  static validateInsert = async () => {
    const user = remult.user;
    if (user?.roles?.includes("admin"))
      return;

    const existingBusiness = await repo(Business).findFirst({
      ownerId: user?.id,
    });

    if (existingBusiness) {
      throw new ForbiddenError("Only one business is allowed per user");
    }
  };

  static can(action: Action) {
    return pc.can(action, "business");
  }

  static filter = () => {
    const user = remult.user;
    if (!user)
      throw new ForbiddenError("Unauthorized");
    if (user.roles?.includes("admin"))
      return {};

    const businessIds = pc.getBusinessIds(user.id);

    return {
      id: { $in: businessIds },
    };
  };
}

export const businessRepo = repo(Business);
export const hasBusinessPerm = UIPermissions<Business>(businessRepo);

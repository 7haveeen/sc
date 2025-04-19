import {
  Entity,
  Relations,
  repo,
} from "remult";
import { vFields } from "@/utils/fields";
import { UIPermissions } from "@/services/iam";
import { User } from "../user";
import { PermissionRole } from "./role";
import { Business } from "$modules/org";
import * as v from "valibot";

import type { PermissionOverrides } from "./types";

export const permissionAssignmentDto = v.object({
  id: v.optional(v.string()),
  userId: v.string(),
  businessId: v.string(),
  roleId: v.string(),
  overrides: v.optional(v.object({
    shopIds: v.array(v.string()),
    restrictions: v.optional(v.array(v.string())),
  })),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity("permission_assignments", {
  allowApiCrud: true,
})
export class PermissionAssignment {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    input: permissionAssignmentDto.entries.userId,
  })
  userId!: string;

  @Relations.toOne(() => User, "userId")
  user?: User;

  @vFields.string({
    input: permissionAssignmentDto.entries.businessId,
  })
  businessId!: string;

  @Relations.toOne(() => Business, "businessId")
  business?: Business;

  @vFields.string({
    input: permissionAssignmentDto.entries.roleId,
  })
  roleId!: string;

  @Relations.toOne(() => PermissionRole, "roleId")
  role?: PermissionRole;

  @vFields.json({
    input: permissionAssignmentDto.entries.overrides,
  })
  overrides?: PermissionOverrides;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt!: Date;
}

export const permissionAssignmentRepo = repo(PermissionAssignment);
export const hasPermissionAssignmentPerm = UIPermissions<PermissionAssignment>(permissionAssignmentRepo);

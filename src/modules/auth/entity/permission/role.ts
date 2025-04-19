import {
  Entity,
  repo,
} from "remult";
import { vFields } from "@/utils/fields";
import { UIPermissions } from "@/services/iam/auth/permission";
import * as v from "valibot";

import type { PermissionResources } from "./types";

export const permissionRoleDto = v.object({
  id: v.optional(v.string()),
  name: v.pipe(v.string(), v.minLength(2, "Role name must be at least 2 characters"), v.maxLength(50, "Role name must be at most 50 characters")),
  businessId: v.string(),
  permissions: v.object({
    resources: v.record(v.string(), v.object({
      actions: v.array(v.string()),
    })),
  }),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity("permission_roles", {
  allowApiCrud: true,
})
export class PermissionRole {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    input: permissionRoleDto.entries.name,
    unique: true,
  })
  name!: string;

  @vFields.string({
    input: permissionRoleDto.entries.businessId,
  })
  businessId!: string;

  @vFields.json({
    input: permissionRoleDto.entries.permissions,
  })
  permissions!: {
    resources: PermissionResources;
  };

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt!: Date;
}

export const permissionRoleRepo = repo(PermissionRole);
export const hasPermissionRolePerm = UIPermissions<PermissionRole>(permissionRoleRepo);

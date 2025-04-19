import {
  Entity,
  ForbiddenError,
  Relations,
  remult,
  repo,
} from "remult";
import { vFields } from "@/utils/fields";
import { PermissionChecker as pc, UIPermissions } from "@/services/iam";
import { User } from "../user";
import * as v from "valibot";

import type { PermissionData } from "./types";
import { PermissionService } from "$modules/auth/service/permission";

export const permissionDto = v.object({
  id: v.optional(v.string()),
  userId: v.string(),
  permissions: v.object({
    roleAccess: v.record(v.string(), v.object({
      businessId: v.string(),
      shops: v.array(v.string()),
      actions: v.array(v.string()),
      role: v.string(),
      restrictions: v.array(v.string()),
    })),
    shopAccess: v.record(v.string(), v.object({
      businessId: v.string(),
      owned: v.boolean(),
    })),
  }),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<Permission>("permission", {
  allowApiRead: true,
  backendPrefilter: () => Permission.filter(),
})
export class Permission {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    input: permissionDto.entries.userId,
  })
  userId!: string;

  @Relations.toOne(() => User, "userId")
  user!: User;

  @vFields.json({
    input: permissionDto.entries.permissions,
  })
  permissions!: PermissionData;

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

  static updateUserPermissions = async (userId: string) => {
    const pm = await PermissionService.update_user_permissions(userId);

    if (!pm.success) {
      return {
        success: false,
        message: pm.message,
      };
    }

    await pc.init(userId);
    return { success: true };
  };
}

export const permissionRepo = repo(Permission);
export const hasPermissionPerm = UIPermissions<Permission>(permissionRepo);

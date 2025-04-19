import { BackendMethod, remult } from "remult";
import type { PermissionData, PermissionOverrides, PermissionResources } from "../entity/permission/types";
import { permissionRoleRepo } from "../entity/permission/role";
import { permissionAssignmentRepo } from "../entity/permission/assignment";
import { businessRepo, shopRepo } from "$modules/org";
import { permissionRepo } from "../entity";

export class PermissionService {
  @BackendMethod({ allowed: true, apiPrefix: "auth/permission" })
  static async create_role(
    businessId: string,
    name: string,
    resources: PermissionResources,
  ) {
    const role = await permissionRoleRepo.insert({
      name,
      businessId,
      permissions: {
        resources,
      },
    });
    return role;
  }

  @BackendMethod({ allowed: true, apiPrefix: "auth/permission" })
  static async assign_role(
    businessId: string,
    userId: string,
    roleId: string,
    overrides?: PermissionOverrides,
  ) {
    const assignment = await permissionAssignmentRepo.insert({
      userId,
      businessId,
      roleId,
      overrides,
    });
    return assignment;
  }

  @BackendMethod({ allowed: true, apiPrefix: "auth/permission" })
  static async update_role(
    businessId: string,
    roleId: string,
    updates: Partial<{
      name: string;
      resources: PermissionResources;
    }>,
  ) {
    const role = await permissionRoleRepo.findId(roleId);
    if (!role || role.businessId !== businessId) {
      throw new Error("Role not found");
    }

    if (updates.name)
      role.name = updates.name;
    if (updates.resources) {
      role.permissions.resources = updates.resources;
    }

    await permissionRoleRepo.save(role);
    return role;
  }

  @BackendMethod({ allowed: true, apiPrefix: "auth/permission" })
  static async update_assignment(
    businessId: string,
    userId: string,
    updates: {
      roleId?: string;
      overrides?: PermissionOverrides;
    },
  ) {
    const assignment = await permissionAssignmentRepo.findFirst({
      userId,
      businessId,
    });

    if (!assignment) {
      throw new Error("Assignment not found");
    }

    if (updates.roleId)
      assignment.roleId = updates.roleId;
    if (updates.overrides)
      assignment.overrides = updates.overrides;

    await permissionAssignmentRepo.save(assignment);
    return assignment;
  }

  @BackendMethod({ allowed: true, apiPrefix: "auth/permission" })
  static async remove_assignment(businessId: string, userId: string) {
    const assignment = await permissionAssignmentRepo.findFirst({
      userId,
      businessId,
    });

    if (assignment) {
      await permissionAssignmentRepo.delete(assignment);
    }
  }

  @BackendMethod({ allowed: true, apiPrefix: "auth/permission" })
  static async get_roles(businessId: string) {
    return permissionRoleRepo.find({
      where: { businessId },
    });
  }

  @BackendMethod({ allowed: true, apiPrefix: "auth/permission" })
  static async get_assignments(businessId: string) {
    return permissionAssignmentRepo.find({
      where: { businessId },
    });
  }

  @BackendMethod({ allowed: true, apiPrefix: "auth/permission" })
  static async update_user_permissions(
    userId: string,
  ): Promise<{ success: boolean; error?: string; message?: string }> {
    if (remult.user?.id !== userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const [ownedBusinesses, assignments] = await Promise.all([
      businessRepo.find({ where: { ownerId: userId } }),
      permissionAssignmentRepo.find({
        where: { userId },
        include: { role: true },
      }),
    ]);

    const permissions: PermissionData = {
      roleAccess: {},
      shopAccess: {},
    };

    // Process assignments
    assignments.forEach((assignment) => {
      if (!assignment.role)
        return;
      const shops = assignment.overrides?.shopIds ?? [];

      permissions.roleAccess[assignment.businessId] = {
        businessId: assignment.businessId,
        shops,
        actions: Object.entries(assignment.role.permissions.resources).flatMap(
          ([resource, perms]) =>
            perms.actions.map(action => `${resource}:${action}`),
        ),
        role: assignment.role.name,
        restrictions: assignment.overrides?.restrictions ?? [],
      };

      shops.forEach(
        shopId =>
          (permissions.shopAccess[shopId] = {
            businessId: assignment.businessId,
            owned: false,
          }),
      );
    });

    // Process owned shops
    const ownedShops = await shopRepo.find({
      where: { businessId: { $in: ownedBusinesses.map(b => b.id) } },
    });

    ownedShops.forEach(
      shop =>
        (permissions.shopAccess[shop.publicId] = {
          businessId: shop.businessId,
          owned: true,
        }),
    );

    await permissionRepo.upsert({
      where: { userId },
      set: {
        permissions,
      },
    });

    return {
      success: true,
      message: "Permissions created successfully",
    };
  }
}

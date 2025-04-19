import { Allow, BackendMethod, ForbiddenError, remult } from "remult";

import { PermissionService, userRepo } from "$modules/auth";
import { try_ } from "@/utils";
import { businessRepo } from "../entity/business";
import { shopRepo } from "../entity/shop";

import type { BusinessType } from "../entity/business";

export class BusinessService {
  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: "business" })
  static async create(data: {
    name: string;
    phone: string;
    address: string;
    type: BusinessType;
  }) {
    const user = remult.user!;

    if (!user.roles?.includes("pending_seller")) {
      throw new ForbiddenError("Unauthorized");
    }

    // Validate input
    if (
      !data.name?.trim()
      || !data.phone?.trim()
      || !data.address?.trim()
      || !data.type
    ) {
      throw new ForbiddenError("Invalid input");
    }

    // Create business
    const [business, businessErr] = await try_(() =>
      businessRepo.insert({
        name: data.name.trim(),
        phone: data.phone.trim(),
        address: data.address.trim(),
        ownerId: user.id,
        type: data.type,
      }),
    );

    if (businessErr) {
      return {
        success: false,
        message: businessErr.message,
      };
    }

    // Create default shop
    const [shop, shopErr] = await try_(() =>
      shopRepo.insert({
        name: data.name,
        businessId: business?.id ?? "",
      }),
    );

    if (shopErr) {
      return {
        success: false,
        message: shopErr.message,
      };
    }

    // Update user
    const [, userUpdateErr] = await try_(() =>
      userRepo.update(user.id, {
        roles: ["seller"],
        activeShopId: shop?.publicId,
      }),
    );

    if (userUpdateErr) {
      return {
        success: false,
        message: userUpdateErr.message,
      };
    }

    // Update User permissions
    const permResult = await PermissionService.update_user_permissions(user.id);
    if (!permResult.success) {
      return permResult;
    }

    return {
      success: true,
      message: "Business created successfully",
    };
  }
}

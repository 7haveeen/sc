import {
  Entity,
  ForbiddenError,
  Relations,
  remult,
  repo,
} from "remult";
import { vFields } from "@/utils/fields";
import { PermissionChecker as pc, UIPermissions } from "@/services/iam";
import { slugify, vPhone } from "@/utils";
import { Business, businessRepo } from "./business";
import { Product } from "../../product/entity/product";
import { SubscriptionPlan } from "$modules/subscription";
import * as v from "valibot";

import type { Action } from "@/services/iam";
import type { ShopSettings, ShopUsage } from "../utils/types";

export const shopDto = v.object({
  id: v.optional(v.string()),
  publicId: v.optional(v.string()),
  name: v.pipe(v.string(), v.minLength(3), v.maxLength(30)),
  slug: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(vPhone()),
  address: v.optional(v.string()),
  description: v.optional(v.string()),
  logo: v.optional(v.string()),
  banner: v.optional(v.string()),
  usage: v.optional(v.record(v.string(), v.unknown())),
  isActive: v.optional(v.boolean(), true),
  settings: v.optional(v.record(v.string(), v.unknown())),
  metadata: v.optional(v.record(v.string(), v.unknown())),
  businessId: v.string(),
  subscriptionId: v.string(),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<Shop>("shop", {
  allowApiRead: () => Shop.can("read"),
  allowApiInsert: () => Shop.can("create"),
  allowApiUpdate: () => Shop.can("update"),
  allowApiDelete: () => Shop.can("delete"),

  apiPrefilter: () => Shop.filter(),

  saving: async (shop, { isNew }) => {
    if (isNew)
      await Shop.validateInsert(shop);
  },
})
export class Shop {
  @vFields.cuid()
  id!: string;

  @vFields.publicId("shp", 10)
  publicId!: string;

  @vFields.string<Shop>({
    input: shopDto.entries.name,
    unique: true,
    saving: (ctx, ref) => {
      if (ref.valueChanged())
        ctx.slug = Shop.generateSlug(ctx.name);
    },
  })
  name!: string;

  @vFields.string<Shop>({
    saving: (ctx, ref, e) => {
      if (e.isNew)
        ref.value = Shop.generateSlug(ctx.name);
    },
  })
  slug?: string;

  @vFields.string({
    input: shopDto.entries.email,
  })
  email?: string;

  @vFields.string<Shop>({
    input: shopDto.entries.phone,
  })
  phone?: string;

  @vFields.string({
    input: shopDto.entries.address,
  })
  address?: string;

  @vFields.string({
    input: shopDto.entries.description,
  })
  description?: string;

  @vFields.string({
    input: shopDto.entries.logo,
  })
  logo?: string;

  @vFields.string({
    input: shopDto.entries.banner,
  })
  banner?: string;

  @vFields.json({
    input: shopDto.entries.usage,
  })
  usage?: ShopUsage;

  @vFields.boolean({
    input: shopDto.entries.isActive,
  })
  isActive?: boolean;

  @vFields.json({
    input: shopDto.entries.settings,
  })
  settings?: ShopSettings;

  @vFields.json({
    input: shopDto.entries.metadata,
  })
  metadata?: Record<string, unknown>;

  @vFields.string()
  businessId!: string;

  @Relations.toOne(() => Business, "businessId")
  business!: Business;

  @vFields.string({
    input: shopDto.entries.subscriptionId,
  })
  subscriptionId!: string;

  @Relations.toOne(() => SubscriptionPlan, "subscriptionId")
  subscription?: SubscriptionPlan;

  @Relations.toMany(() => Product)
  products?: Product[];

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;

  static validateInsert = async (shop: Shop) => {
    const business = await businessRepo.findId(shop.businessId, {
      include: { shops: true },
    });
    if (!business)
      throw new ForbiddenError("Business not found");

    const shopCount = business.shops?.length ?? 0;
    if (!business.allowMultipleShops && shopCount > 0) {
      throw new ForbiddenError(
        "Multiple shops are not allowed for this business",
      );
    }

    if (shopCount >= (business.maxShops ?? 1)) {
      throw new ForbiddenError(
        "Shop limit of " + (business.maxShops ?? 1) + " reached for this business",
      );
    }
  };

  static filter = () => {
    const user = remult.user;
    if (!user)
      throw new ForbiddenError("Unauthorized");
    if (user.roles?.includes("admin"))
      return {};

    const shopIds = pc.getShopIds(user?.id);

    return { publicId: { $in: shopIds } };
  };

  static generateSlug(name: string): string {
    return slugify(name);
  }

  static can(action: Action) {
    return pc.can(action, "shop");
  }
}

export const shopRepo = repo(Shop);
export const hasShopPerm = UIPermissions<Shop>(shopRepo);

import {
  Entity,
  repo,
} from "remult";
import { vFields } from "@/utils/fields";
import { UIPermissions } from "@/services/iam";
import * as v from "valibot";

import type {
  SubscriptionFeatures,
  SubscriptionLimits,
  SubscriptionPricing,
  Tier,
} from "../utils/types";

export const subscriptionTierDto = v.object({
  id: v.optional(v.string()),
  tier: v.string(),
  name: v.string(),
  description: v.optional(v.string()),
  limits: v.any(),
  features: v.any(),
  pricing: v.any(),
  isActive: v.optional(v.boolean()),
  isDefault: v.optional(v.boolean()),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<SubscriptionTier>("subscription_tier", {
  allowApiRead: true,
  allowApiUpdate: ["admin"],
  allowApiDelete: ["admin"],
})
export class SubscriptionTier {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    input: subscriptionTierDto.entries.tier,
  })
  tier!: Tier;

  @vFields.string({
    input: subscriptionTierDto.entries.name,
  })
  name!: string;

  @vFields.string({
    input: subscriptionTierDto.entries.description,
  })
  description?: string;

  @vFields.json({
    input: subscriptionTierDto.entries.limits,
  })
  limits!: SubscriptionLimits;

  @vFields.json({
    input: subscriptionTierDto.entries.features,
  })
  features!: SubscriptionFeatures;

  @vFields.json({
    input: subscriptionTierDto.entries.pricing,
  })
  pricing!: SubscriptionPricing;

  @vFields.boolean({
    defaultValue: () => true,
    input: subscriptionTierDto.entries.isActive,
  })
  isActive?: boolean;

  @vFields.boolean({
    defaultValue: () => false,
    input: subscriptionTierDto.entries.isDefault,
  })
  isDefault?: boolean;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;
}

export const subscriptionTierRepo = repo(SubscriptionTier);
export const hasSubscriptionTierPerm = UIPermissions<SubscriptionTier>(subscriptionTierRepo);

import {
  Entity,
  Relations,
  repo,
} from "remult";
import { vFields } from "@/utils/fields";
import { UIPermissions } from "@/services/iam";
import * as v from "valibot";
import { SubscriptionTier } from "./tier";
import { BillingInterval } from "../utils/types";

import type {
  SubscriptionBilling,
  SubscriptionStatus,
  SubscriptionUsage,
} from "../utils/types";

export const subscriptionPlanDto = v.object({
  id: v.optional(v.string()),
  tierId: v.string(),
  billingInterval: v.enum(BillingInterval),
  usage: v.optional(v.record(v.string(), v.unknown())),
  billing: v.optional(v.record(v.string(), v.unknown())),
  startDate: v.date(),
  endDate: v.date(),
  isActive: v.optional(v.boolean()),
  status: v.optional(v.string()),
  createdAt: v.optional(v.date()),
  updatedAt: v.optional(v.date()),
});

@Entity<SubscriptionPlan>("subscription_plan", {
  allowApiRead: true,
  allowApiUpdate: ["admin"],
  allowApiDelete: ["admin"],
})
export class SubscriptionPlan {
  @vFields.cuid()
  id!: string;

  @vFields.string({
    input: subscriptionPlanDto.entries.tierId,
  })
  tierId!: string;

  @Relations.toOne(() => SubscriptionTier, "tierId")
  tier!: SubscriptionTier;

  @vFields.string({
    input: subscriptionPlanDto.entries.billingInterval,
  })
  billingInterval!: BillingInterval;

  @vFields.json({
    input: subscriptionPlanDto.entries.usage,
  })
  usage!: SubscriptionUsage;

  @vFields.json({
    input: subscriptionPlanDto.entries.billing,
  })
  billing!: SubscriptionBilling;

  @vFields.date({
    input: subscriptionPlanDto.entries.startDate,
  })
  startDate!: Date;

  @vFields.date({
    input: subscriptionPlanDto.entries.endDate,
  })
  endDate!: Date;

  @vFields.boolean({
    defaultValue: () => true,
    input: subscriptionPlanDto.entries.isActive,
  })
  isActive!: boolean;

  @vFields.string({
    defaultValue: () => "active",
    input: subscriptionPlanDto.entries.status,
  })
  status!: SubscriptionStatus;

  @vFields.createdAt()
  createdAt!: Date;

  @vFields.updatedAt()
  updatedAt?: Date;
}

export const subscriptionPlanRepo = repo(SubscriptionPlan);
export const hasSubscriptionPlanPerm = UIPermissions<SubscriptionPlan>(subscriptionPlanRepo);

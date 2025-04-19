import { shopRepo } from "$modules/org";
import {
  BillingInterval,
  BillingStatus,
  subscriptionPlanRepo,
  SubscriptionStatus,
  subscriptionTierRepo,
} from "$modules/subscription";
import dayjs from "dayjs";
import { PermissionChecker as pc } from "@/services/iam";
import { BackendMethod, ForbiddenError, remult } from "remult";

export class SubscriptionService {
  @BackendMethod({
    allowed: () => pc.can("create", "subscription"),
    apiPrefix: "subscription",
  })
  static async create() {
    if (!remult.user) {
      throw new ForbiddenError("Unauthorized");
    }
    await pc.init(remult.user.id);

    const tier = await subscriptionTierRepo.findOne({
      where: {
        isDefault: true,
      },
    });

    if (!tier) {
      throw new Error("Tier not found");
    }

    const now = dayjs();
    const yearFromNow = now.add(1, "year");

    const billingInterval: BillingInterval = BillingInterval.Yearly;
    const billingStatus: BillingStatus = BillingStatus.Paid;
    const subscriptionStatus: SubscriptionStatus = SubscriptionStatus.Active;

    const plan = await subscriptionPlanRepo.insert({
      tierId: tier.id,
      billingInterval,
      usage: {
        products: 0,
        shops: 1,
        staff: 0,
        storage: 0,
        bandwidth: 0,
      },
      billing: {
        amount: Number(tier.pricing.yearly),
        currency: tier.pricing.currency,
        status: billingStatus,
        lastBillingDate: now.toDate(),
        nextBillingDate: yearFromNow.toDate(),
      },
      startDate: now.toDate(),
      endDate: yearFromNow.toDate(),
      status: subscriptionStatus,
      isActive: true,
    });

    return plan;
  }

  @BackendMethod({
    allowed: () => pc.can("update", "subscription"),
    apiPrefix: "subscription",
  })
  static async upgrade(shopId: string) {
    if (!remult.user) {
      throw new ForbiddenError("Unauthorized");
    }
    await pc.init(remult.user.id);

    const shop = await shopRepo.findId(shopId);
    if (!shop)
      throw new ForbiddenError("Shop not found");

    if (!pc.can("update", "subscription")) {
      throw new ForbiddenError("Insufficient permissions");
    }

    // TODO: Implement upgrade logic
  }
}

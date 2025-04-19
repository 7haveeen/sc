import { Allow, BackendMethod, ForbiddenError } from "remult";
import { shopRepo } from "../entity/shop";
import { SubscriptionService } from "$modules/subscription";

export class ShopService {
  @BackendMethod({ allowed: Allow.authenticated, apiPrefix: "shop" })
  static async create(data: { name: string; businessId: string }) {
    if (!data.businessId) {
      throw new ForbiddenError("Business ID is required");
    }

    // Create free subscription for new shop
    const subscription = await SubscriptionService.create();

    // Create shop with free subscription
    return await shopRepo.insert({
      name: data.name.trim(),
      businessId: data.businessId,
      slug: data.name.trim(),
      subscriptionId: subscription.id,
    });
  }
}

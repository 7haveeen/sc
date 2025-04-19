import { Module } from "$lib/rms";
import { SubscriptionPlan, SubscriptionTier } from "./entity";
import { SubscriptionService } from "./service";

export * from "./entity";
export * from "./service";
export * from "./utils/types";

export const subscription: (o?: { log: string }) => Module = (o) => {
  const m = new Module({
    name: "subscription",
    entities: [
      SubscriptionPlan,
      SubscriptionTier,
    ],
    controllers: [
      SubscriptionService,
    ],
    initApi: async () => {
      m.log.success(o?.log ?? "Ready!");
    },
  });
  return m;
};

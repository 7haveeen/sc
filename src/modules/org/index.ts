import { Module } from "$lib/rms";
import { Business, Invitation, Shop } from "./entity";
import { BusinessService, ShopService } from "./service";

export * from "./entity";
export * from "./service";

export const org: (o?: { log: string }) => Module = (o) => {
  const m = new Module({
    name: "org",
    entities: [
      Shop,
      Business,
      Invitation,
    ],
    controllers: [
      ShopService,
      BusinessService,
    ],
    initApi: async () => {
      m.log.success(o?.log ?? "Ready!");
    },
  });
  return m;
};

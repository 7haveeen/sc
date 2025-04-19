import { Module } from "$lib/rms";
import { Product } from "./entity";

export * from "./entity";

export const product: (o?: { log: string }) => Module = (o) => {
  const m = new Module({
    name: "product",
    entities: [
      Product,
    ],
    controllers: [],
    initApi: async () => {
      m.log.success(o?.log ?? "Ready!");
    },
  });
  return m;
};

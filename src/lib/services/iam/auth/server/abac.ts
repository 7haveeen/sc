import { remult } from "remult";
import { PermissionCache } from "../../../../stores/cache";
import { permissionRepo } from "$modules/auth";

export type EntityName =
  | "shop"
  | "product"
  | "order"
  | "customer"
  | "business"
  | "staff"
  | "subscription";

export type Action = "create" | "read" | "update" | "delete";

export class PermissionChecker {
  private static readonly TTL = 60 * 1000;

  private static getCache(userId: string) {
    const cache = PermissionCache.getUserCache(userId);
    const getShopAccess = (shopId: string) => cache?.shopAccess[shopId];
    const getPerms = (businessId: string) => cache?.roleAccess[businessId];
    return { cache, getShopAccess, getPerms };
  }

  private static getCurrentUserContext() {
    const user = remult.user;
    if (!user?.id || !user.activeShopId)
      return null;
    const { cache, getShopAccess, getPerms } = this.getCache(user.id);
    if (!cache)
      return null;
    const shopAccess = getShopAccess(user.activeShopId);
    return { user, cache, shopAccess, getPerms };
  }

  static getBusinessIds(userId: string): string[] {
    const { cache } = this.getCache(userId);
    return !cache?.shopAccess
      ? []
      : [
          ...new Set(
            Object.values(cache.shopAccess).map(rel => rel.businessId),
          ),
        ];
  }

  static getShopIds(userId: string): string[] {
    return this.getCache(userId).cache?.shopAccess
      ? Object.keys(this.getCache(userId).cache!.shopAccess)
      : [];
  }

  static can(action: Action, resource: EntityName): boolean {
    const ctx = this.getCurrentUserContext();
    if (remult.isAllowed("admin"))
      return true;
    if (!ctx)
      return false;
    if (ctx.shopAccess?.owned)
      return true;

    const perms = ctx.getPerms(ctx.shopAccess?.businessId ?? "");
    return perms?.actions.includes(`${resource}:${action}`) ?? false;
  }

  static hasRestriction(restriction: string): boolean {
    const ctx = this.getCurrentUserContext();
    if (!ctx)
      return true;
    if (remult.isAllowed("admin") || ctx.shopAccess?.owned)
      return false;

    const perms = ctx.getPerms(ctx.shopAccess?.businessId ?? "");
    return perms?.restrictions?.includes(restriction) ?? true;
  }

  static getRestrictions(): string[] {
    const ctx = this.getCurrentUserContext();
    if (!ctx || !ctx.shopAccess?.businessId)
      return [];
    if (ctx.shopAccess.owned)
      return [];

    return ctx.getPerms(ctx.shopAccess.businessId)?.restrictions ?? [];
  }

  static async init(userId: string) {
    const { cache } = this.getCache(userId);

    if (cache && Date.now() - cache.timestamp < this.TTL)
      return;

    const userPerms = await permissionRepo.findFirst({ userId });

    if (!userPerms)
      return;

    PermissionCache.setUserCache(userId, {
      roleAccess: userPerms.permissions.roleAccess,
      shopAccess: userPerms.permissions.shopAccess,
      timestamp: Date.now(),
    });
  }

  static clearCache(userId: string): void {
    PermissionCache.clearUserCache(userId);
  }
}

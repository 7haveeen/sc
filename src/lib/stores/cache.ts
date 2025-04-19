import type { RoleAccess, ShopAccess } from "../../entities/auth";

export type UserPermissionCache = {
  roleAccess: Record<string, RoleAccess>;
  shopAccess: Record<string, ShopAccess>;
  timestamp: number;
};

export class PermissionCache {
  private static cache = new Map<string, UserPermissionCache>();

  static getUserCache(userId: string): UserPermissionCache | undefined {
    return this.cache.get(userId);
  }

  static setUserCache(userId: string, data: UserPermissionCache): void {
    this.cache.set(userId, data);
  }

  static clearUserCache(userId: string): void {
    this.cache.delete(userId);
  }
}

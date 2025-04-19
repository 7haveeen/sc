import { remult } from "remult";
import type { Repository } from "remult";

type Role = "pending_seller" | "seller" | "admin";

export function hasRole(role: Role): boolean {
  return !!remult.user?.roles?.includes(role);
}

export function UIPermissions<T>(repo: Repository<T>) {
  return {
    read: () => repo.metadata.apiReadAllowed,
    update: (entity?: T) => repo.metadata.apiUpdateAllowed(entity),
    create: (entity?: T) => repo.metadata.apiInsertAllowed(entity),
    delete: (entity?: T) => repo.metadata.apiDeleteAllowed(entity),
  };
}

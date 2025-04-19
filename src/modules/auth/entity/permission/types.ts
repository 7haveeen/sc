export type ResourceAction = "create" | "read" | "update" | "delete";

export type ResourceType =
  | "users"
  | "products"
  | "orders"
  | "inventory"
  | "shops"
  | "settings";

export type PermissionOverrides = {
  shopIds: string[];
  restrictions?: Array<
    | "read-only"
    | "no-delete"
    | "view-own"
    | "can-refund"
    | "can-process-returns"
    | "can-void-transaction"
    | "can-adjust-inventory"
    | "can-approve-discounts"
  >;
};

export type ResourcePermissions = {
  actions: ResourceAction[];
};

export type PermissionResources = {
  [K in ResourceType]?: ResourcePermissions;
};

export type RoleAccess = {
  businessId: string;
  shops: string[];
  actions: string[];
  role: string;
  restrictions: string[];
};

export type ShopAccess = {
  businessId: string;
  owned: boolean;
};

export type PermissionData = {
  roleAccess: Record<string, RoleAccess>;
  shopAccess: Record<string, ShopAccess>;
};

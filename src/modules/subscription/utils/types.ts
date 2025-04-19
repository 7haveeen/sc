/**
 * Subscription tier levels available in the system
 */
export enum Tier {
  Free = "free",
  Basic = "basic",
  Professional = "professional",
  Custom = "custom",
}

/**
 * Analytics capabilities offered at different tier levels
 */
export enum AnalyticsTier {
  Basic = "basic",
  Advanced = "advanced",
  Enterprise = "enterprise",
}

/**
 * Support levels offered with subscriptions
 */
export enum SupportTier {
  Basic = "basic",
  Priority = "priority",
  Dedicated = "dedicated",
}

/**
 * ISO 4217 currency codes
 */
export type CurrencyCode = "USD" | "ZIG";

/**
 * Billing interval options for subscriptions
 */
export enum BillingInterval {
  Monthly = "monthly",
  Yearly = "yearly",
}

/**
 * Quantitative limits imposed by subscription plans
 */
export type SubscriptionLimits = Readonly<{
  products: number;
  shops: number;
  staff: number;
  storage: number; // in MB
}>;

/**
 * Feature flags determined by subscription tier
 */
export type SubscriptionFeatures = Readonly<{
  core: Readonly<{
    analytics: AnalyticsTier;
    support: SupportTier;
    backup: boolean;
    api: boolean;
    whiteLabel: boolean;
    customDomain: boolean;
    auditLogs: boolean;
    teamRoles: boolean;
  }>;
  shop: Readonly<{
    variants: boolean;
    inventory: boolean;
    discounts: boolean;
    tax: boolean;
    reviews: boolean;
    abandonedCart: boolean;
    giftCards: boolean;
    preOrders: boolean;
    wholesale: boolean;
    multiCurrency: boolean;
    subscriptions: boolean;
  }>;
  business: Readonly<{
    multiShop: boolean;
    bulkImport: boolean;
    advancedSeo: boolean;
    inventorySync: boolean;
    advancedShipping: boolean;
    loyaltyProgram: boolean;
    marketing: boolean;
    reporting: boolean;
    customBranding: boolean;
  }>;
}>;

/**
 * Possible states for the billing of a subscription
 */
export enum BillingStatus {
  Paid = "paid",
  Unpaid = "unpaid",
  Overdue = "overdue",
  Cancelled = "cancelled",
  Refunded = "refunded",
}

/**
 * Possible states for a subscription
 */
export enum SubscriptionStatus {
  Active = "active",
  Trialing = "trialing",
  PastDue = "past_due",
  Cancelled = "cancelled",
  Expired = "expired",
}

/**
 * Tracks current resource usage for a subscription
 */
export type SubscriptionUsage = Readonly<{
  products: number;
  shops: number;
  staff: number;
  storage: number;
  bandwidth: number;
}>;

/**
 * Billing information for a subscription
 */
export type SubscriptionBilling = Readonly<{
  amount: number;
  currency: CurrencyCode;
  lastBillingDate: Date;
  nextBillingDate: Date;
  status: BillingStatus;
}>;

/**
 * Pricing structure for a subscription tier
 */
export type SubscriptionPricing = Readonly<{
  monthly: number;
  yearly: number;
  currency: CurrencyCode;
}>;

/**
 * Default resource limits for the free tier
 */
export const DEFAULT_LIMITS: SubscriptionLimits = {
  products: 10,
  shops: 1,
  staff: 2,
  storage: 1024,
} as const;

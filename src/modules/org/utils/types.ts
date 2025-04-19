export type ShopUsage = {
  products: {
    total: number;
    limit: number;
  };
  storage: {
    used: number;
    limit: number;
  };
  lastUpdated: Date;
};

export type ShippingMethod =
  | "local_pickup"
  | "flat_rate"
  | "weight_based"
  | "free_shipping"
  | "table_rate"
  | "distance_based";

export type PaymentMethod =
  | "card"
  | "bank_transfer"
  | "cash_on_delivery"
  | "wallet";

export type ShopSettings = {
  general: {
    currency: string;
    taxRate: number;
    orderPrefix: string;
    timezone: string;
  };
  features: {
    wholesale: boolean;
    preOrders: boolean;
    reviews: boolean;
    inventory: boolean;
    variants: boolean;
    discounts: boolean;
    giftCards: boolean;
    subscriptions: boolean;
  };
  shipping: {
    methods: ShippingMethod[];
    zones: string[];
  };
  payment: {
    methods: PaymentMethod[];
    gateway: string;
  };
  notifications: {
    usageAlerts: boolean;
    billingAlerts: boolean;
    marketingEmails: boolean;
  };
  billing: {
    autoRenew: boolean;
    invoiceEmails: boolean;
  };
};

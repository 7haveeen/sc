import type { RequestEvent } from "@sveltejs/kit";

declare module "remult" {
  export interface UserInfo {
    email: string;
    avatar?: string;
    username?: string;
    activeShopId?: string;
    session: {
      id: string;
      expiresAt: Date;
      impersonatedBy?: string;
    };
  }

  export interface RemultContext {
    request: RequestEvent;
    setHeaders: (headers: Record<string, string>) => void;
    setCookie: (...args: Parameters<RequestEvent["cookies"]["set"]>) => void;
    deleteCookie: (...args: Parameters<RequestEvent["cookies"]["delete"]>) => void;
  }
}

export {};

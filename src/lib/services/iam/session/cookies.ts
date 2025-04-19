import { DEV } from "esm-env";
import { remult } from "remult";
import type { Cookies } from "@sveltejs/kit";

/**
 * Cookie options type definition
 */
export type CookieOptions = {
  path?: string;
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
};

/**
 * Default cookie options
 */
const DEFAULT_OPTIONS = {
  path: "/",
  httpOnly: true,
  secure: !DEV,
  sameSite: "lax",
} as const;

/**
 * Cookie name constants for authentication flows
 */
export const COOKIE_NAMES = {
  AUTH_INIT: "haven_init",
  AUTH_SESSION: "haven_auth",
  AUTH_2FA: "haven_2fa",
  AUTH_JOIN: "haven_join",
} as const;

/**
 * Generic cookie setter with secure defaults
 * @param cookies - SvelteKit cookies object
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Additional cookie options
 */
export function setCookie(
  cookies: Cookies,
  name: string,
  value: string,
  options: Partial<CookieOptions> = {},
): void {
  cookies.set(name, value, {
    ...DEFAULT_OPTIONS,
    ...options,
  });
}

/**
 * Generic cookie deletion helper
 * @param cookies - SvelteKit cookies object
 * @param name - Cookie name to delete
 * @param path - Cookie path (defaults to "/")
 */
export function deleteCookie(cookies: Cookies, name: string, path = "/"): void {
  cookies.delete(name, { path });
}

// Specific cookie management functions that use remult context

/**
 * Sets the session token cookie with secure defaults
 * @param token - The session token to store in the cookie
 * @param expiresAt - When the cookie should expire
 */
export function setSessionTokenCookie(token: string, expiresAt: Date): void {
  if (remult.context.setCookie) {
    remult.context.setCookie(COOKIE_NAMES.AUTH_SESSION, token, {
      expires: expiresAt,
      ...DEFAULT_OPTIONS,
    });
  }
}

/**
 * Deletes the session token cookie
 */
export function deleteSessionTokenCookie(): void {
  if (remult.context.deleteCookie) {
    remult.context.deleteCookie(COOKIE_NAMES.AUTH_SESSION, {
      path: "/",
      secure: !DEV,
      sameSite: "lax",
    });
  }
}

/**
 * Sets a cookie for OAuth code verifier
 * @param codeVerifier - The code verifier to store
 */
export function setCodeVerifierCookie(codeVerifier: string): void {
  if (remult.context.setCookie) {
    remult.context.setCookie("code_verifier", codeVerifier, {
      ...DEFAULT_OPTIONS,
      maxAge: 60 * 10, // 10 minutes
    });
  }
}

/**
 * Sets a cookie for OAuth state
 * @param provider - OAuth provider name
 * @param state - OAuth state value
 */
export function setOAuthStateCookie(provider: string, state: string): void {
  if (remult.context.setCookie) {
    remult.context.setCookie(`${provider}_oauth_state`, state, {
      ...DEFAULT_OPTIONS,
      maxAge: 60 * 10, // 10 minutes
    });
  }
}

/**
 * Sets a redirect cookie
 * @param redirect - Redirect URL
 */
export function setRedirectCookie(redirect: string): void {
  if (remult.context.setCookie) {
    remult.context.setCookie("haven_redirect", redirect, {
      ...DEFAULT_OPTIONS,
      maxAge: 60 * 10, // 10 minutes
    });
  }
}

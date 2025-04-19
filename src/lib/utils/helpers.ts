import dayjs from "dayjs";
import { customAlphabet } from "nanoid";
import * as v from "valibot";

const n = "0123456789";
const u = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const l = "abcdefghijklmnopqrstuvwxyz";

export const alphaNumeric = n + u + l;
export const alphaSmall = l;

export function nanoid(length?: number, alphabet?: string) {
  const generate = customAlphabet(alphabet || alphaNumeric, length || 14);
  return generate();
}

export function verifyExpirationDate(expiresAt: Date): boolean {
  return dayjs().isAfter(dayjs(expiresAt));
}

export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s_-]+/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function autoSlug() {
  return v.pipe(
    v.string(),
    v.transform(val => slugify(val)),
  );
}

export function vPhone() {
  return v.pipe(
    v.string(),
    v.regex(/^\+[1-9]\d{9,14}$/, "Invalid phone number"),
  );
}

export function vZimbabwePhone() {
  return v.pipe(
    v.string(),
    v.regex(/^(\+263|263|0)7[1-9]\d{7}$/, "Invalid Zimbabwean phone number"),
    v.transform((val) => {
      if (val.startsWith("+263"))
        return val;
      if (val.startsWith("263"))
        return "+" + val;
      if (val.startsWith("0"))
        return "+263" + val.slice(1);
      return val;
    }),
  );
}

// String overload
export function encodeText(text: string | null | undefined): string;
// Uint8Array overload
export function encodeText(text: string | null | undefined, maxBytes: number): Uint8Array;
// Implementation
/**
 * Encodes text using TextEncoder
 * @param text - The text to encode (will handle null/undefined gracefully)
 * @param maxBytes - If provided, returns a Uint8Array sliced to the specified length
 * @returns String if maxBytes is not provided, or Uint8Array if maxBytes is provided
 */
export function encodeText(text: string | null | undefined, maxBytes?: number): string | Uint8Array {
  if (text === null || text === undefined) {
    return maxBytes !== undefined ? new Uint8Array(0) : "";
  }

  if (maxBytes !== undefined) {
    return new TextEncoder().encode(text).slice(0, maxBytes);
  }

  return text;
}

/**
 * Masks an email address for privacy by showing only the first few characters of the username
 * @param email - The email address to mask
 * @returns A masked version of the email (e.g., "joh***@example.com")
 */
export function maskEmail(email: string): string {
  if (!email)
    return "";

  const [username, domain] = email.split("@");
  if (!username || !domain)
    return email;

  const visibleChars = Math.min(3, username.length);
  const maskedUsername = username.substring(0, visibleChars) + "*".repeat(Math.max(2, username.length - visibleChars));

  return maskedUsername + "@" + domain;
}

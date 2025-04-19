import { sha256 } from "@oslojs/crypto/sha2";
import { sha1 } from "@oslojs/crypto/sha1";
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from "@oslojs/encoding";

/**
 * Generate a random token encoded in base32 (lowercase, no padding).
 * @returns {string} Randomly generated token.
 */
export function generateToken(): string {
  const TOKEN_BYTE_LENGTH = 20 as const;
  const bytes: Uint8Array = new Uint8Array(TOKEN_BYTE_LENGTH);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

/**
 * Encode a token string using SHA-256 and hex encoding (lowercase).
 * @param {string} token - The token to encode.
 * @returns {string} Encoded token as hex string.
 */
export function encodeToken(token: string): string {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
}

/**
 * Generate a random token and return its encoded value.
 * @returns {string} Encoded random token.
 */
export function generateEncodedToken(): string {
  return encodeToken(generateToken());
}

/**
 * Checks if a password has been compromised using the "Have I Been Pwned" API.
 * Returns true if the password is NOT found in breaches (strong), false if found (weak).
 *
 * @param {string} password - Password to check.
 * @returns {Promise<boolean>} True if password is strong; false if breached.
 */
export async function verifyPasswordStrength(password: string): Promise<boolean> {
  const HASH_PREFIX_LENGTH = 5 as const;
  const HASH_SUFFIX_LENGTH = 35 as const;
  const hash: string = encodeHexLowerCase(sha1(new TextEncoder().encode(password)));
  const hashPrefix: string = hash.slice(0, HASH_PREFIX_LENGTH);
  const response: Response = await fetch("https://api.pwnedpasswords.com/range/" + hashPrefix);
  if (!response.ok) {
    console.warn("Password breach check service unavailable");
    return true;
  }
  const data: string = await response.text();
  return !data.split("\n").some((item: string) => hash === hashPrefix + item.slice(0, HASH_SUFFIX_LENGTH).toLowerCase());
}

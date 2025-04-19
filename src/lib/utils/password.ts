import { hash, verify } from "argon2";

/**
 * Hash a password using Argon2 (server-only).
 * @param password - The plaintext password to hash.
 * @returns The hashed password string.
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, {
    memoryCost: 32768,
    timeCost: 2,
    parallelism: 1,
    hashLength: 32,
  });
}

/**
 * Verify a password against a hash using Argon2 (server-only).
 * @param hash - The hashed password string.
 * @param password - The plaintext password to verify.
 * @returns True if the password matches the hash, false otherwise.
 */
export async function verifyPasswordHash(hash: string, password: string): Promise<boolean> {
  if (!hash || !password) {
    return false;
  }
  return await verify(hash, password);
}

import { remult } from "remult";
import type { UserInfo } from "remult";
import { DEV } from "esm-env";
import { encodeToken } from "@/utils/oslo";
import { sessionRepo } from "$modules/auth";
import type { Session } from "$modules/auth/entity/session";

// Session configuration
const SESSION_EXPIRY = DEV ? 15 * 60 * 1000 : 30 * 60 * 1000;
// Percentage of session duration that must be left before renewal
const RENEWAL_THRESHOLD = 0.1;

/**
 * Creates a new session for a user
 * @param token - Raw session token
 * @param userId - User ID to associate with the session
 * @returns The created session object
 */
export async function createSession(token: string, userId: string): Promise<Session> {
  const headers = remult.context.request?.request?.headers;
  const sessionToken = encodeToken(token);

  return sessionRepo.insert({
    token: sessionToken,
    userId,
    expiresAt: new Date(Date.now() + SESSION_EXPIRY),
    userAgent: headers?.get("user-agent") || undefined,
    ipAddress: headers?.get("x-forwarded-for") || undefined,
  });
}

/**
 * Validates a session token and optionally renews it if needed
 * @param token - Raw session token to validate
 * @returns User information if session is valid, undefined otherwise
 */
export async function validateSessionToken(token: string): Promise<UserInfo | undefined> {
  const sessionToken = encodeToken(token);

  // Find session with associated user in a single query
  const result = await sessionRepo.findFirst(
    { token: sessionToken },
    { include: { user: true } },
  );

  const session = result;
  const user = result?.user;

  // Handle expired or invalid session
  if (!session || Date.now() >= session.expiresAt.getTime()) {
    await invalidateSessionIfExists(sessionToken);
    return undefined;
  }

  // Handle session with missing user
  if (!user) {
    await invalidateSessionIfExists(sessionToken);
    return undefined;
  }

  // Check if session needs renewal
  const timeUntilExpiry = session.expiresAt.getTime() - Date.now();
  const renewSession = timeUntilExpiry <= SESSION_EXPIRY * RENEWAL_THRESHOLD;

  if (renewSession) {
    // Extend session expiry
    const newExpiryDate = new Date(Date.now() + SESSION_EXPIRY);
    await sessionRepo.update(
      { token: sessionToken },
      { expiresAt: newExpiryDate },
    );
    session.expiresAt = newExpiryDate;
  }

  // Return user info with session details
  return {
    id: user.id,
    username: user.username,
    roles: user.roles,
    email: user.email,
    avatar: user.avatar,
    name: user.name,
    activeShopId: user.activeShopId,
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
      impersonatedBy: session.impersonatedBy,
    },
  };
}

/**
 * Helper function to delete a session if it exists
 * @param sessionToken - Encoded session token
 */
async function invalidateSessionIfExists(sessionToken: string): Promise<void> {
  try {
    await sessionRepo.delete({ token: sessionToken });
  }
  catch {
    // Ignore errors when deleting non-existent sessions
  }
}

/**
 * Invalidates a specific session by its token
 * @param sessionToken - Encoded session token to invalidate
 */
export async function invalidateSession(sessionToken: string): Promise<void> {
  return sessionRepo.delete({ token: sessionToken });
}

/**
 * Invalidates all sessions for a specific user
 * @param userId - User ID whose sessions should be invalidated
 */
export async function invalidateUserSessions(userId: string): Promise<void> {
  return sessionRepo.delete({ userId });
}

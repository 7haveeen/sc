import type { OtpType } from "$modules/auth";
import { otpRepo } from "$modules/auth";
import { nanoid, verifyExpirationDate } from "./helpers";
import dayjs from "dayjs";

/**
 * OTP response object structure
 */
type OTPResponse = {
  success: boolean;
  message?: string;
  code?: string;
};

/**
 * Generates a random 6-character OTP
 */
export function generateRandomOTP(): string {
  return nanoid(6);
}

/**
 * Creates a new OTP for a user
 * @param userId - User identifier
 * @param type - Type of OTP being created
 * @param expiryMinutes - OTP validity period in minutes (default: 30)
 * @returns The generated OTP code
 */
export async function createOTP(
  userId: string,
  type: OtpType,
  expiryMinutes = 30,
): Promise<string> {
  const token = generateRandomOTP();
  const expiresAt = dayjs().add(expiryMinutes, "minutes").toDate();
  const existingOTP = await otpRepo.findFirst({ userId, type });

  if (existingOTP) {
    await otpRepo.update(existingOTP.id, { token, expiresAt });
  }
  else {
    await otpRepo.insert({ userId, token, type, expiresAt });
  }

  return token;
}

/**
 * Verifies an OTP code for a user
 * @param userId - User identifier
 * @param token - OTP code to verify
 * @param type - Type of OTP being verified
 * @returns Success status and message
 */
export async function verifyOTP(
  userId: string,
  token: string,
  type: OtpType,
): Promise<OTPResponse> {
  if (!userId || !token || !type) {
    return { success: false, message: "Invalid request params" };
  }

  const otp = await otpRepo.findFirst({ userId, token, type });

  if (!otp || verifyExpirationDate(otp.expiresAt)) {
    if (otp)
      await otpRepo.delete(otp.id);
    return { success: false, message: "Invalid verification code" };
  }

  await otpRepo.delete(otp.id);

  return { success: true, message: "Verified" };
}

/**
 * Resends an OTP to a user, with rate limiting
 * @param userId - User identifier
 * @param type - Type of OTP being resent
 * @returns Success status, message, and new code if successful
 */
export async function resendOTP(
  userId: string,
  type: OtpType,
): Promise<OTPResponse> {
  if (!userId || !type) {
    return { success: false, message: "Invalid request params" };
  }

  const existingOTP = await otpRepo.findFirst({ userId, type });

  if (!existingOTP) {
    const token = await createOTP(userId, type);
    return token
      ? { success: true, code: token }
      : { success: false, message: "Failed to send verification code" };
  }

  // Rate limiting: one code per minute
  const lastUpdateTime = existingOTP.updatedAt || existingOTP.createdAt;

  const isWithinRateLimit = dayjs().diff(dayjs(lastUpdateTime), "seconds") < 60;
  if (isWithinRateLimit) {
    return {
      success: false,
      message: "Please wait before requesting another code",
    };
  }

  const token = await createOTP(userId, type);

  await otpRepo.update(existingOTP.id, {
    token,
    expiresAt: dayjs().add(30, "minutes").toDate(),
  });

  return { success: true, code: token };
}

import { BackendMethod } from "remult";
import { EmailService } from "$modules/auth";
import type { OtpType } from "$modules/auth";
import { createOTP, resendOTP, verifyOTP } from "@/utils/otp";

type AuthResponse = {
  success: boolean;
  message?: string;
  userId?: string;
};

export class OtpService {
  private static readonly API_PREFIX = "auth/2fa/otp";

  private static async validateRequest(userId: string, email: string, type: OtpType): Promise<AuthResponse | null> {
    if (!userId || !email || !type) {
      return { success: false, message: "Invalid request parameters" };
    }

    const checkDomain = await EmailService.check(email);

    if (checkDomain?.disposable) {
      return { success: false, message: "Domain not allowed" };
    }

    return null;
  }

  @BackendMethod({ allowed: true, apiPrefix: OtpService.API_PREFIX })
  static async create(userId: string, email: string, type: OtpType): Promise<AuthResponse> {
    const validationError = await OtpService.validateRequest(userId, email, type);
    if (validationError)
      return validationError;

    const token = await createOTP(userId, type);
    if (!token) {
      return { success: false, message: "Failed to create OTP" };
    }

    // TODO: Send verification email
    console.log("Verification code " + token);
    return { success: true, message: "Verification code sent" };
  }

  @BackendMethod({ allowed: true, apiPrefix: OtpService.API_PREFIX })
  static async verify(userId: string, token: string, type: OtpType): Promise<AuthResponse> {
    if (!userId) {
      return { success: false, message: "Invalid user ID" };
    }

    const result = await verifyOTP(userId, token, type);
    return {
      success: result.success,
      message: result.message || "Verification successful",
    };
  }

  @BackendMethod({ allowed: true, apiPrefix: OtpService.API_PREFIX })
  static async resend(userId: string, email: string, type: OtpType): Promise<AuthResponse> {
    const validationError = await OtpService.validateRequest(userId, email, type);
    if (validationError)
      return validationError;

    const result = await resendOTP(userId, type);
    if (!result.success) {
      return { success: false, message: result.message };
    }

    // TODO: Send verification email
    console.log("New verification code " + result.code);
    return { success: true, message: "Verification code sent" };
  }
}

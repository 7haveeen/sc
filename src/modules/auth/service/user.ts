import { BackendMethod } from "remult";
import { accountRepo, OtpService, OtpType, ProviderId, userRepo } from "$modules/auth";
import { verifyPasswordStrength } from "@/utils";

type AuthResponse = {
  success: boolean;
  verified?: boolean;
  message?: string;
};

export class UserService {
  static async validateUser(
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await userRepo.findId(userId);

    if (!user) {
      return { success: false, message: "Invalid user" };
    }
    return { success: true, message: "Valid user" };
  }

  @BackendMethod({ allowed: true, apiPrefix: "auth/join" })
  static async create_seller(
    id: string,
    email: string,
    token: string,
  ): Promise<AuthResponse> {
    if (!id || !email || !token) {
      return { success: false, message: "Invalid request params" };
    }

    const verifyEmail = await OtpService.verify(id, token, OtpType.Join);

    if (!verifyEmail.success) {
      return { success: false, verified: false, message: verifyEmail.message };
    }

    const user = await userRepo.insert({
      id,
      email,
      roles: ["pending_seller"],
      emailVerified: true,
    });

    if (!user) {
      return { success: false, message: "Failed to create user" };
    }

    return { success: true, message: "Seller Created successfully" };
  }

  @BackendMethod({ allowed: true, apiPrefix: "auth/join" })
  static async signup(userId: string, password: string): Promise<AuthResponse> {
    if (!userId || !password) {
      return { success: false, message: "Invalid request params" };
    }

    const strongPassword = await verifyPasswordStrength(password);
    if (!strongPassword) {
      return { success: false, message: "Weak password" };
    }

    const userResult = await UserService.validateUser(userId);
    if (!userResult.success) {
      return userResult;
    }

    const insertAcc = await accountRepo.insert({
      accountId: userId,
      providerId: ProviderId.Credentials,
      userId,
      password,
    });

    if (!insertAcc) {
      return { success: false, message: "Failed to create account" };
    }

    return { success: true, message: "Account created successfully" };
  }

  @BackendMethod({ allowed: true, apiPrefix: "auth/join/email" })
  static async check(email: string): Promise<boolean> {
    const user = await userRepo.findFirst({
      email,
      emailVerified: true,
    });

    return !!user;
  }
}

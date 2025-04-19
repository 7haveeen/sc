import * as v from "valibot";

export const passkeySignInSchema = v.object({
  attestation_object: v.pipe(v.string(), v.minLength(1)),
  client_data_json: v.pipe(v.string(), v.minLength(1)),
  credential_id: v.pipe(v.string(), v.minLength(1)),
  signature: v.pipe(v.string(), v.minLength(1)),
});

export const passwordSignInSchema = v.object({
  email: v.pipe(v.string(), v.email("Enter your email")),
  password: v.pipe(v.string(), v.minLength(1, "Enter your password")),
});

export const otpSchema = v.object({
  verification_code: v.pipe(
    v.string(),
    v.minLength(6, "Enter a 6-character code"),
    v.maxLength(6),
  ),
});

export const forgotPasswordSchema = v.object({
  email: v.pipe(v.string(), v.email("Enter a valid email")),
});

export type OTPSchema = typeof otpSchema;
export type ForgotPasswordSchema = typeof forgotPasswordSchema;
export type PasskeySignInSchema = typeof passkeySignInSchema;
export type PasswordSignInSchema = typeof passwordSignInSchema;

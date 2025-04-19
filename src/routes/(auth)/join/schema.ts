import * as v from "valibot";

export const email = v.object({
  email: v.pipe(
    v.string(),
    v.email("Please enter a valid email address"),
    v.maxLength(255),
  ),
});

export const verification = v.object({
  verification_code: v.pipe(
    v.string(),
    v.minLength(6, "Enter a 6-character code"),
    v.maxLength(6),
  ),
});

export const password = v.pipe(
  v.object({
    password: v.pipe(
      v.string(),
      v.regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, "Enter a strong password"),
    ),
    confirmPassword: v.string(),
  }),
  v.forward(
    v.partialCheck(
      [["password"], ["confirmPassword"]],
      input => input.password === input.confirmPassword,
      "Passwords don't match",
    ),
    ["confirmPassword"],
  ),
);

export const passkey = v.object({
  name: v.optional(v.string()),
  attestation_object: v.pipe(v.string(), v.minLength(1)),
  client_data_json: v.pipe(v.string(), v.minLength(1)),
  device_type: v.pipe(v.string(), v.minLength(1)),
  transports: v.pipe(v.string(), v.minLength(1)),
});

export type EmailSchema = typeof email;
export type VerificationSchema = typeof verification;
export type PasswordSchema = typeof password;
export type PasskeySchema = typeof passkey;

export function calculatePasswordStrength(password: string): number {
  const SCORES = {
    minLength: 12,
    base: 25,
    charType: 15,
    variety: 3.75,
    max: 100,
  };

  const patterns = /[A-Z].*[a-z]|[a-z].*[A-Z]|\d|[^A-Za-z0-9]/g;
  const uniqueMatches = new Set(password.match(patterns) || []).size;

  return Math.min(
    SCORES.max,
    Math.min(SCORES.base, (password.length / SCORES.minLength) * SCORES.base)
    + uniqueMatches * (SCORES.charType + SCORES.variety),
  );
}

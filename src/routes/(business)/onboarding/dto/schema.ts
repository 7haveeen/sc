import { z } from "zod";

export const onboardingSchema = z.object({
  businessType: z.enum(["individual", "corporate"]),
  businessName: z
    .string({
      required_error: "Business name is required",
      invalid_type_error: "Business name must be text",
    })
    .min(3, "Business name must be at least 3 characters")
    .max(50, "Business name cannot exceed 40 characters"),
  phone: z
    .string({
      required_error: "Phone number is required",
      invalid_type_error: "Phone number must be text",
    })
    .regex(/^\+?\d{10,14}$/, {
      message: "Please enter a valid phone number",
    }),
  address: z
    .string({
      required_error: "Address is required",
      invalid_type_error: "Address must be text",
    })
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address cannot exceed 100 characters"),
});

export type OnboardingSchema = z.infer<typeof onboardingSchema>;

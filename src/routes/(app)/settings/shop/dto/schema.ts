import { z } from "zod";

export const shopProfileSchema = z.object({
  name: z
    .string({
      required_error: "Shop name is required",
      invalid_type_error: "Shop name must be text",
    })
    .min(3, "Shop name must be at least 3 characters")
    .max(30, "Shop name cannot exceed 30 characters"),
  slug: z.string(),
  email: z
    .string()
    .refine(
      val => !val || z.string().email().safeParse(val).success,
      "Please enter a valid email",
    )
    .optional(),
  phone: z
    .string()
    .refine(val => !val || /^\+?\d{10,14}$/.test(val), "Please enter a valid phone number")
    .optional(),
  address: z
    .string()
    .refine(
      val => !val || (val.length >= 5 && val.length <= 100),
      val => ({
        message: val.length < 5 ? "Address must be at least 5 characters" : "Address cannot exceed 100 characters",
      }),
    )
    .optional(),
  description: z
    .string()
    .refine(
      val => !val || (val.length >= 10 && val.length <= 300),
      val => ({
        message: val.length < 10 ? "Description must be at least 10 characters" : "Description cannot exceed 300 characters",
      }),
    )
    .optional(),
  logo: z.string().optional(),
});

export type ShopProfileSchema = typeof shopProfileSchema;

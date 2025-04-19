import { z } from "zod";

export const businessInfoSchema = z.object({
  businessType: z.enum(["individual", "corporate"]).default("individual"),
  businessName: z.string().min(3, "Business name must be at least 3 characters").max(30),
  generalLocation: z.string().min(3, "Location must be at least 3 characters").max(30),
  ownerInfo: z.object({
    lastName: z.string().min(2, "Last name must be at least 2 characters").max(30),
    firstName: z.string().min(2, "First name must be at least 2 characters").max(30),
    middleName: z.string().max(30, "Middle name cannot exceed 30 characters").optional(),
    residentialAddress: z.string().min(5, "Address must be at least 5 characters").max(100),
  }),
  idDocument: z.object({
    type: z.enum(["passport", "identity_card"], {
      errorMap: () => ({
        message: "Please select a valid ID type.",
      }),
    }),
    file: z.instanceof(File).optional().array().nullable(),
  }),
  registeredName: z.string().optional(),
  registeredAddress: z.string().optional(),
  registrationNumber: z.string().optional(),
  registrationDocs: z.instanceof(File).optional().array().nullable(),
});

export type BusinessInfoSchema = typeof businessInfoSchema;

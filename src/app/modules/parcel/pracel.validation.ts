import { z } from "zod";

export const createParcelZodSchema = z.object({
  type: z
    .string({
      required_error: "Type is required",
      invalid_type_error: "Type must be a string",
    })
    .min(1, { message: "Type cannot be empty" }),

  weight: z
    .number({
      required_error: "Weight is required",
      invalid_type_error: "Weight must be a number",
    })
    .positive({ message: "Weight must be a positive number" }),

  receiver: z
    .string({
      required_error: "Receiver is required",
      invalid_type_error: "Receiver must be a string",
    })
    .email("Invalid email address format.")
    .min(2, { message: "Receiver name must be at least 2 characters long" })
    .max(100, { message: "Receiver name cannot exceed 100 characters" }),

  fromAddress: z
    .string({
      required_error: "From address is required",
      invalid_type_error: "From address must be a string",
    })
    .min(5, { message: "From address must be at least 5 characters long" })
    .max(200, { message: "From address cannot exceed 200 characters" }),

  toAddress: z
    .string({
      required_error: "To address is required",
      invalid_type_error: "To address must be a string",
    })
    .min(5, { message: "To address must be at least 5 characters long" })
    .max(200, { message: "To address cannot exceed 200 characters" }),

  division: z
    .string({
      required_error: "Division is required",
      invalid_type_error: "Division must be a string",
    })
    .min(2, { message: "Division must be at least 2 characters long" })
    .max(100, { message: "Division cannot exceed 100 characters" }),

  deliveryDate: z
    .union([
      z
        .string()
        .refine(
          (val) => !isNaN(Date.parse(val)),
          { message: "Invalid delivery date format" }
        ),
      z.date()
    ])
    .optional(),
});
export const parcelStatusEnum = z.enum([
  "requested",
  "approved",
  "dispatched",
  "in_transit",
  "delivered",
  "cancelled",
]);

// Schema for updating parcel status
export const updateParcelStatusZodSchema = z.object({
  status: parcelStatusEnum,
});
import z from "zod";


export const parcelStatusEnum = z.enum([
    "requested",
    "approved",
    "dispatched",
    "in_transit",
    "delivered",
    "cancelled",
])

export const createParcelZodSchema = z.object({
    body: z.object({
        sender: z
            .string({ error: "Sender ID is required" }),
        receiver: z
            .string({ error: "receiver ID is required" }),
        weight: z
            .number({ error: "Weight must be a number" })
            .positive("Weight must be a positive number"),
        destination: z
            .string({ error: "Destination is required" })
            .min(10, { error: "must be at least 10 characters long." })
            .max(100, { error: "destination cannot exceed 100 characters" }),
        price: z
            .number({ error: "Price must be a Number" })

    })
});

export const updateParcelStatusZodSchema = z.object({
    body: z.object({
        status: parcelStatusEnum,
    }),
});

export const ParcelValidation = {
    createParcelZodSchema,
    updateParcelStatusZodSchema,
};
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelValidation = exports.updateParcelStatusZodSchema = exports.createParcelZodSchema = exports.parcelStatusEnum = void 0;
const zod_1 = __importDefault(require("zod"));
exports.parcelStatusEnum = zod_1.default.enum([
    "requested",
    "approved",
    "dispatched",
    "in_transit",
    "delivered",
    "cancelled",
]);
exports.createParcelZodSchema = zod_1.default.object({
    body: zod_1.default.object({
        sender: zod_1.default
            .string({ error: "Sender ID is required" }),
        receiver: zod_1.default
            .string({ error: "receiver ID is required" }),
        weight: zod_1.default
            .number({ error: "Weight must be a number" })
            .positive("Weight must be a positive number"),
        destination: zod_1.default
            .string({ error: "Destination is required" })
            .min(10, { error: "must be at least 10 characters long." })
            .max(100, { error: "destination cannot exceed 100 characters" }),
        price: zod_1.default
            .number({ error: "Price must be a Number" })
    })
});
exports.updateParcelStatusZodSchema = zod_1.default.object({
    body: zod_1.default.object({
        status: exports.parcelStatusEnum,
    }),
});
exports.ParcelValidation = {
    createParcelZodSchema: exports.createParcelZodSchema,
    updateParcelStatusZodSchema: exports.updateParcelStatusZodSchema,
};

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserZodSchema = void 0;
const z = __importStar(require("zod"));
exports.createUserZodSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters long.")
        .max(50, "Name cannot exceed 50 characters"),
    email: z
        .string()
        .email("Invalid email address format.")
        .min(5, "Email must be at least 5 characters long.")
        .max(100, "Email cannot exceed 100 characters"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long.")
        .regex(/^(?=.*[A-Z])/, "Password must contain at least 1 uppercase letter.")
        .regex(/^(?=.*[!@#$%^&*])/, "Password must contain at least 1 special character.")
        .regex(/^(?=.*\d)/, "Password must contain at least 1 number."),
    phone: z
        .string()
        .regex(/^(?:\+8801\d{9}|01\d{9})$/, "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX")
        .optional(),
    address: z
        .string()
        .max(200, "Address cannot exceed 200 characters.")
        .optional(),
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactUs = void 0;
const mongoose_1 = require("mongoose");
const contactUsSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
exports.ContactUs = (0, mongoose_1.model)("ContactUs", contactUsSchema);

import { Schema, model } from "mongoose";
import { IContactUs } from "./contactUs.interface";

const contactUsSchema = new Schema<IContactUs>(
  {
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
  },
  { timestamps: true }
);

export const ContactUs = model<IContactUs>("ContactUs", contactUsSchema);
import { model, Schema } from "mongoose";
import { IAuthProvider, IsActive, IUser, Role } from "./user.interface";

const authProviderSchema = new Schema<IAuthProvider>({
    provider: {
        type: String,
        required: true
    },
    providerId: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
    _id: false
})


const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: [String],
        enum: Object.values(Role),
        default: [Role.USER]
    },
    isActive: {
        type: String,
        enum: Object.values(IsActive),
        default: IsActive.ACTIVE
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    phone: { type: String },
    password: { type: String },
    picture: { type: String },
    address: { type: String },
    auths: [authProviderSchema]
})

export const User = model<IUser>("User", userSchema)
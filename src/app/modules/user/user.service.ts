import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from 'bcryptjs'
import httpStatus from 'http-status-codes'
const createUser = async (payload: Partial<IUser>) => {
    const { email, password, ...rest } = payload;
    const authProvider: IAuthProvider = { provider: "credentials", providerId: email as string }
    const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND))
    const user = await User.create({
        email,
        password: hashedPassword,
        auths: [authProvider],
        ...rest
    })
    return user
}

const getAllUsers = async () => {
    const users = await User.find({});
    const totalUsers = await User.countDocuments();
    return {
        data: users,
        meta: {
            total: totalUsers
        }
    }
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
    const isUserExist = await User.findById(userId);
    if (!isUserExist) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
    }

    const isAdmin = decodedToken.role.includes(Role.ADMIN) || decodedToken.role.includes(Role.SUPER_ADMIN);
    const isSelfUpdate = decodedToken.userId === userId;

    if (!isAdmin && !isSelfUpdate) {
        throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this user");
    }

    if (payload.role) {
        if (!isAdmin) {
            throw new AppError(httpStatus.FORBIDDEN, "Only Admins can update roles");
        }

        if (
            payload.role.includes(Role.SUPER_ADMIN) &&
            decodedToken.role.includes(Role.ADMIN)
        ) {
            throw new AppError(httpStatus.FORBIDDEN, "Only Super Admin can promote to SUPER_ADMIN");
        }
    }

    if ((payload.isActive !== undefined || payload.isDeleted !== undefined) && !isAdmin) {
        throw new AppError(httpStatus.FORBIDDEN, "Only Admins can update user status");
    }

    if (payload.password) {
        payload.password = await bcryptjs.hash(
            payload.password,
            Number(envVars.BCRYPT_SALT_ROUND)
        );
    }

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {
        new: true,
        runValidators: true,
    });

    return newUpdatedUser;
};
const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");
    return {
        data: user
    }
};
const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user
    }
};
export const UserServices = {
    createUser,
    getAllUsers,
    updateUser,
    getMe,
    getSingleUser,
}
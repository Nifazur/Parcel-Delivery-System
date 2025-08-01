import AppError from "../errorHelpers/AppError";
import { IsActive } from "../modules/user/user.interface";
import { User } from "../modules/user/user.model"
import httpStatus from 'http-status-codes'

export const ensureActiveUser = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found or has been deleted')
    }

    if (user.isActive === IsActive.BLOCKED) {
        throw new AppError(httpStatus.FORBIDDEN, 'User is Blocked')
    }

    if (user.isActive === IsActive.INACTIVE) {
        throw new AppError(httpStatus.UNAUTHORIZED, 'User is Inactive')
    }

    return user;
}
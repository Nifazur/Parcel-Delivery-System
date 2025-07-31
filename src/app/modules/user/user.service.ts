import { envVars } from "../../config/env";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from 'bcryptjs'

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

export const UserServices = {
    createUser,
    getAllUsers
}
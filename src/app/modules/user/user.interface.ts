export enum Role {
    SUPER_ADMIN = "SUPER_ADMIN",
    ADMIN = "ADMIN",
    USER = "USER"
}

export enum IsActive {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    BLOCKED = "BLOCKED"
}

export interface IAuthProvider {
    provider: string;
    providerId: string;
}

export interface IUser {
    name: string,
    email: string,
    phone?: string,
    password?: string,
    picture?: string,
    address?: string,
    role: Role,
    isActive?: IsActive,
    isDeleted?: boolean,
    auths: IAuthProvider[]
}
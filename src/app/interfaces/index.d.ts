import { JwtPayload } from "jsonwebtoken";

export interface MyJwtPayload extends JwtPayload {
    _id: string;
}

declare global {
    namespace Express {
        interface Request {
            user: JwtPayload
        }
    }
}
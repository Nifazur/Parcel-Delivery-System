/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userTokens";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from 'http-status-codes'
import { setAuthCookie } from "../../utils/setCookie";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { AuthServices } from "./auth.service";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (error: any, user: any, info: any) => {
        if (error) {
            return next(new AppError(401, error))
        }
        if (!user) {
            return next(new AppError(401, info.message))
        }

        const userTokens = await createUserTokens(user)


        const { password: pass, ...rest } = user.toObject()


        setAuthCookie(res, userTokens)

        sendResponse(res, {
            success: true,
            statusCode: httpStatus.OK,
            message: "User Logged In Successfully",
            data: {
                accessToken: userTokens.accessToken,
                refreshToken: userTokens.refreshToken,
                user: rest

            },
        })
    })(req, res, next)

})

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        throw new AppError(httpStatus.BAD_REQUEST, "No Refresh Token Received From Cookies")
    }
    const tokenInfo = await AuthServices.getNewAccessToken(refreshToken)

    setAuthCookie(res, tokenInfo)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "New Access Token Retrieved Successfully",
        data: tokenInfo
    })
})
// const logOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

//     res.clearCookie("accessToken", {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax"
//     })
//     res.clearCookie("refreshToken", {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax"
//     })

//     sendResponse(res, {
//         statusCode: httpStatus.OK,
//         success: true,
//         message: "User Log out Successfully",
//         data: []
//     })
// })

const logOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const cookieOptions: import("express").CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: envVars.NODE_ENV === "production" ? "none" : "lax" as "none" | "lax",
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Log out Successfully",
        data: [],
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const decodedToken = req.user
    await AuthServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload)

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Reset Password Successfully",
        data: null
    })
})
const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let redirectTo = req.query.state ? req.query.state as string : ""

    if (redirectTo.startsWith("/")) {
        redirectTo = redirectTo.slice(1)
    }
    const user = req.user;
    // eslint-disable-next-line no-console
    console.log({ user: user });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
    }
    const tokenInfo = await createUserTokens(user)

    setAuthCookie(res, tokenInfo)

    res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)

})

export const AuthControllers = {
    credentialsLogin,
    getNewAccessToken,
    logOut,
    resetPassword,
    googleCallbackController
}
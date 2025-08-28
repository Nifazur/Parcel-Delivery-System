"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const env_1 = require("../config/env");
const setAuthCookie = (res, tokenInfo) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: env_1.envVars.NODE_ENV === "production" ? 'none' : 'lax'
        });
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: env_1.envVars.NODE_ENV === "production" ? 'none' : 'lax'
        });
    }
};
exports.setAuthCookie = setAuthCookie;

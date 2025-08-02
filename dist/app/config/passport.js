"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const env_1 = require("./env");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const passport_local_1 = require("passport-local");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Local Strategy (unchanged)
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password"
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isUserExist = yield user_model_1.User.findOne({ email });
        if (!isUserExist) {
            return done(null, false, { message: "User does not exist" });
        }
        const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider === "google");
        if (isGoogleAuthenticated && !isUserExist.password) {
            return done(null, false, { message: "You have authenticated through Google. Please login with Google and set a password first." });
        }
        const isPasswordMatched = yield bcryptjs_1.default.compare(password, isUserExist.password);
        if (!isPasswordMatched) {
            return done(null, false, { message: "Password does not match" });
        }
        return done(null, isUserExist);
    }
    catch (error) {
        console.log("Local Strategy Error:", error);
        return done(error);
    }
})));
// Fixed Google Strategy for new project
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: env_1.envVars.GOOGLE_CLIENT_ID,
    clientSecret: env_1.envVars.GOOGLE_CLIENT_SECRET,
    callbackURL: env_1.envVars.GOOGLE_CALLBACK_URL,
    // Add these new options for new Google projects
    scope: ['profile', 'email'],
    skipUserProfile: false,
    passReqToCallback: false
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        console.log("=== Google Strategy Callback ===");
        console.log("Profile ID:", profile.id);
        console.log("Display Name:", profile.displayName);
        console.log("Emails:", profile.emails);
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        if (!email) {
            console.log("❌ No email found in Google profile");
            return done(new Error("No email found in Google profile"));
        }
        console.log("✅ Email found:", email);
        let user = yield user_model_1.User.findOne({ email });
        if (!user) {
            console.log("🆕 Creating new user...");
            user = yield user_model_1.User.create({
                email,
                name: profile.displayName,
                picture: (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0].value,
                role: user_interface_1.Role.USER,
                isVerified: true,
                auths: [
                    {
                        provider: "google",
                        providerId: profile.id
                    }
                ]
            });
            console.log("✅ New user created successfully");
        }
        else {
            console.log("👤 Existing user found");
            // Check if user already has Google auth
            const hasGoogleAuth = user.auths.some(auth => auth.provider === "google");
            if (!hasGoogleAuth) {
                user.auths.push({
                    provider: "google",
                    providerId: profile.id
                });
                yield user.save();
                console.log("✅ Added Google auth to existing user");
            }
        }
        return done(null, user);
    }
    catch (err) {
        console.log("❌ Google Strategy Error:", err);
        return done(err);
    }
})));
passport_1.default.serializeUser((user, done) => {
    console.log("📝 Serializing user:", user._id);
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(id);
        console.log("📖 Deserializing user:", id);
        done(null, user);
    }
    catch (err) {
        console.log("❌ Deserialize error:", err);
        done(err, null);
    }
}));

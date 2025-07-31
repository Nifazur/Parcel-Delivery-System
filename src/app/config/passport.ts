/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import passport, { Profile } from "passport";
import { Strategy as GoogleStrategy, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";
import { Strategy as LocalStrategy } from "passport-local";
import bcryptjs from 'bcryptjs'

// Local Strategy (unchanged)
passport.use(
    new LocalStrategy({
        usernameField: "email",
        passwordField: "password"
    }, async (email: string, password: string, done) => {
        try {
            const isUserExist = await User.findOne({ email })

            if (!isUserExist) {
                return done(null, false, { message: "User does not exist" });
            }

            const isGoogleAuthenticated = isUserExist.auths.some(providerObjects => providerObjects.provider === "google")

            if (isGoogleAuthenticated && !isUserExist.password) {
                return done(null, false, { message: "You have authenticated through Google. Please login with Google and set a password first." });
            }

            const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

            if (!isPasswordMatched) {
                return done(null, false, { message: "Password does not match" });
            }

            return done(null, isUserExist)

        } catch (error) {
            console.log("Local Strategy Error:", error);
            return done(error);
        }
    })
)

// Fixed Google Strategy for new project
passport.use(
    new GoogleStrategy(
        {
            clientID: envVars.GOOGLE_CLIENT_ID,
            clientSecret: envVars.GOOGLE_CLIENT_SECRET,
            callbackURL: envVars.GOOGLE_CALLBACK_URL,
            // Add these new options for new Google projects
            scope: ['profile', 'email'],
            skipUserProfile: false,
            passReqToCallback: false
        },
        async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
            try {
                console.log("=== Google Strategy Callback ===");
                console.log("Profile ID:", profile.id);
                console.log("Display Name:", profile.displayName);
                console.log("Emails:", profile.emails);

                const email = profile.emails?.[0].value;
                if (!email) {
                    console.log("❌ No email found in Google profile");
                    return done(new Error("No email found in Google profile"));
                }

                console.log("✅ Email found:", email);
                let user = await User.findOne({ email });

                if (!user) {
                    console.log("🆕 Creating new user...");
                    user = await User.create({
                        email,
                        name: profile.displayName,
                        picture: profile.photos?.[0].value,
                        role: Role.USER,
                        isVerified: true,
                        auths: [
                            {
                                provider: "google",
                                providerId: profile.id
                            }
                        ]
                    });
                    console.log("✅ New user created successfully");
                } else {
                    console.log("👤 Existing user found");
                    // Check if user already has Google auth
                    const hasGoogleAuth = user.auths.some(auth => auth.provider === "google");
                    if (!hasGoogleAuth) {
                        user.auths.push({
                            provider: "google",
                            providerId: profile.id
                        });
                        await user.save();
                        console.log("✅ Added Google auth to existing user");
                    }
                }

                return done(null, user);
            } catch (err) {
                console.log("❌ Google Strategy Error:", err);
                return done(err);
            }
        }
    )
)

passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
    console.log("📝 Serializing user:", user._id);
    done(null, user._id)
})

passport.deserializeUser(async (id: string, done: any) => {
    try {
        const user = await User.findById(id);
        console.log("📖 Deserializing user:", id);
        done(null, user)
    } catch (err) {
        console.log("❌ Deserialize error:", err);
        done(err, null)
    }
})
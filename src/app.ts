import express, { Request, Response } from 'express'
import { router } from './app/routes'
import cors from 'cors'
import { globalErrorHandler } from './app/middlewares/globalErrorHandler'
import notFound from './app/middlewares/notFound'
import { envVars } from './app/config/env'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import expressSession from "express-session";
import "./app/config/passport";
const app = express()
app.use(express.json())
app.use(cors({
    origin: envVars.FRONTEND_URL,
    credentials: true
}))
app.set("trust proxy", 1);

app.use(cookieParser())

app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())


app.use("/api/v1", router)

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: "Welcome to Parcel Delivery System"
    })
})

app.use(globalErrorHandler)
app.use(notFound)

export default app
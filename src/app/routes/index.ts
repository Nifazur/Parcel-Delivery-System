import { Router } from "express"
import { UserRoutes } from "../modules/user/user.route"
import { AuthRoutes } from "../modules/auth/auth.route"
import { DivisionRoutes } from "../modules/division/division.route"
import { ParcelRoutes } from "../modules/parcel/parcel.route"
import { ContactUsRoutes } from "../modules/contactUs/contactUs.route"

export const router = Router()
const moduleRoutes = [
    {
        path: "/user",
        route: UserRoutes
    },
    {
        path: "/auth",
        route: AuthRoutes
    },
    {
        path: "/division",
        route: DivisionRoutes
    },
    {
        path: "/parcel",
        route: ParcelRoutes
    },
    {
        path: "/contact-us",
        route: ContactUsRoutes
    }
]

moduleRoutes.forEach((route) => {
    router.use(route.path, route.route)
})
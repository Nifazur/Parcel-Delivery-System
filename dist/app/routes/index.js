"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const user_route_1 = require("../modules/user/user.route");
const auth_route_1 = require("../modules/auth/auth.route");
const division_route_1 = require("../modules/division/division.route");
const parcel_route_1 = require("../modules/parcel/parcel.route");
const contactUs_route_1 = require("../modules/contactUs/contactUs.route");
exports.router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: "/user",
        route: user_route_1.UserRoutes
    },
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes
    },
    {
        path: "/division",
        route: division_route_1.DivisionRoutes
    },
    {
        path: "/parcel",
        route: parcel_route_1.ParcelRoutes
    },
    {
        path: "/contact-us",
        route: contactUs_route_1.ContactUsRoutes
    }
];
moduleRoutes.forEach((route) => {
    exports.router.use(route.path, route.route);
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactUsRoutes = void 0;
const express_1 = require("express");
const contactUs_controller_1 = require("./contactUs.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const router = (0, express_1.Router)();
// Public route - anyone can send a message
router.post("/", contactUs_controller_1.ContactUsController.createMessage);
// Admin routes
router.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), contactUs_controller_1.ContactUsController.getAllMessages);
router.get("/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), contactUs_controller_1.ContactUsController.getMessageById);
exports.ContactUsRoutes = router;

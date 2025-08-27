import { Router } from "express";
import { ContactUsController } from "./contactUs.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = Router();

// Public route - anyone can send a message
router.post("/", ContactUsController.createMessage);

// Admin routes
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ContactUsController.getAllMessages);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ContactUsController.getMessageById);

export const ContactUsRoutes = router;
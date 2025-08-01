import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserZodSchema } from "./user.validation";
import { Role } from "./user.interface";
import { checkAuth } from "../../middlewares/checkAuth";

const router = Router()

router.post("/register", validateRequest(createUserZodSchema), UserController.createUser)
router.get("/all-users", UserController.getAllUsers)
router.patch("/:id", checkAuth(...Object.values(Role)), UserController.updateUser)

export const UserRoutes = router
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DivisionRoutes = void 0;
// division.route.ts
const express_1 = require("express");
// Assuming you have role middleware
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const division_controller_1 = require("./division.controller");
const router = (0, express_1.Router)();
// Admin only routes
router.post('/register', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), division_controller_1.DivisionController.createDivision);
router.put('/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), division_controller_1.DivisionController.updateDivision);
router.delete('/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), division_controller_1.DivisionController.deleteDivision);
// Public routes (for getting divisions when creating parcels)
router.get('/', division_controller_1.DivisionController.getAllDivisions);
router.get('/:id', division_controller_1.DivisionController.getDivisionById);
exports.DivisionRoutes = router;

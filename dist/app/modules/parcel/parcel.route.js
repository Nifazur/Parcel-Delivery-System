"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = require("express");
const parcel_controller_1 = require("./parcel.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const router = (0, express_1.Router)();
// Public routes
router.get('/track/:trackingId', parcel_controller_1.ParcelController.trackParcel);
// User routes
router.post('/create', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.ParcelController.createParcel);
router.get('/my-parcel-history', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.ParcelController.getMyParcels);
router.get('/:id', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.ParcelController.getParcelById);
// Sender routes
router.get('/sent', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.SENDER), parcel_controller_1.ParcelController.getMySentParcels);
router.patch('/cancel/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.SENDER), parcel_controller_1.ParcelController.cancelParcel);
// Receiver routes
router.get('/received', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.RECEIVER), parcel_controller_1.ParcelController.getMyReceivedParcels);
router.patch('/confirm-delivery/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.RECEIVER), parcel_controller_1.ParcelController.confirmDelivery);
// Super Admin and Admin routes
router.get('/all', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), parcel_controller_1.ParcelController.getAllParcels);
router.patch('/status/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), parcel_controller_1.ParcelController.updateParcelStatus);
router.patch('/block/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), parcel_controller_1.ParcelController.blockParcel);
router.patch('/unblock/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), parcel_controller_1.ParcelController.unblockParcel);
router.get('/admin/statistics', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), parcel_controller_1.ParcelController.getParcelStatistics);
exports.ParcelRoutes = router;

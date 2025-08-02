"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelRoutes = void 0;
const express_1 = require("express");
const parcel_controller_1 = require("./parcel.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const validateRequest_1 = require("../../middlewares/validateRequest");
const pracel_validation_1 = require("./pracel.validation");
const router = (0, express_1.Router)();
// Public routes
router.get('/track/:trackingId', parcel_controller_1.ParcelController.trackParcel);
// Admin statistics route
router.get('/admin/statistics', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), parcel_controller_1.ParcelController.getParcelStatistics);
// Get all parcels (Admin only) - MOVED BEFORE /:id
router.get('/all', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), parcel_controller_1.ParcelController.getAllParcels);
// User parcel history - MOVED BEFORE /:id
router.get('/my-parcel-history', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.ParcelController.getMyParcels);
// Sender routes - MOVED BEFORE /:id
router.get('/sent', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.SENDER), parcel_controller_1.ParcelController.getMySentParcels);
// Receiver routes - MOVED BEFORE /:id
router.get('/received', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.RECEIVER), parcel_controller_1.ParcelController.getMyReceivedParcels);
// User routes
router.post('/create', (0, validateRequest_1.validateRequest)(pracel_validation_1.createParcelZodSchema), (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.ParcelController.createParcel);
// PATCH routes with specific paths (these are fine as they have specific segments)
router.patch('/cancel/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.SENDER), parcel_controller_1.ParcelController.cancelParcel);
router.patch('/confirm-delivery/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN, user_interface_1.Role.RECEIVER), parcel_controller_1.ParcelController.confirmDelivery);
router.patch('/status/:id', (0, validateRequest_1.validateRequest)(pracel_validation_1.updateParcelStatusZodSchema), (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), parcel_controller_1.ParcelController.updateParcelStatus);
router.patch('/block/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), parcel_controller_1.ParcelController.blockParcel);
router.patch('/unblock/:id', (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN, user_interface_1.Role.SUPER_ADMIN), parcel_controller_1.ParcelController.unblockParcel);
// Get parcel by ID - THIS MUST BE THE LAST GET ROUTE
router.get('/:id', (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), parcel_controller_1.ParcelController.getParcelById);
exports.ParcelRoutes = router;

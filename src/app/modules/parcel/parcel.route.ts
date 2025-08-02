import { Router } from 'express';
import { ParcelController } from './parcel.controller';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { validateRequest } from '../../middlewares/validateRequest';
import { createParcelZodSchema, updateParcelStatusZodSchema } from './pracel.validation';

const router = Router();

// Public routes
router.get('/track/:trackingId', ParcelController.trackParcel);


// Admin statistics route
router.get('/admin/statistics', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.getParcelStatistics);

// Get all parcels (Admin only) - MOVED BEFORE /:id
router.get('/all', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.getAllParcels);

// User parcel history - MOVED BEFORE /:id
router.get('/my-parcel-history', checkAuth(...Object.values(Role)), ParcelController.getMyParcels);

// Sender routes - MOVED BEFORE /:id
router.get('/sent', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.SENDER), ParcelController.getMySentParcels);

// Receiver routes - MOVED BEFORE /:id
router.get('/received', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.RECEIVER), ParcelController.getMyReceivedParcels);

// User routes
router.post('/create', validateRequest(createParcelZodSchema), checkAuth(...Object.values(Role)), ParcelController.createParcel);

// PATCH routes with specific paths (these are fine as they have specific segments)
router.patch('/cancel/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.SENDER), ParcelController.cancelParcel);
router.patch('/confirm-delivery/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.RECEIVER), ParcelController.confirmDelivery);
router.patch('/status/:id', validateRequest(updateParcelStatusZodSchema), checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.updateParcelStatus);
router.patch('/block/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.blockParcel);
router.patch('/unblock/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.unblockParcel);

// Get parcel by ID - THIS MUST BE THE LAST GET ROUTE
router.get('/:id', checkAuth(...Object.values(Role)), ParcelController.getParcelById);

export const ParcelRoutes = router;
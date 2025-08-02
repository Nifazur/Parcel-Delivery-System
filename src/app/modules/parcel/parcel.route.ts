import { Router } from 'express';
import { ParcelController } from './parcel.controller';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';

const router = Router();

// Public routes
router.get('/track/:trackingId', ParcelController.trackParcel);


// User routes
router.post('/create', checkAuth(...Object.values(Role)), ParcelController.createParcel);
router.get('/my-parcel-history', checkAuth(...Object.values(Role)), ParcelController.getMyParcels);
router.get('/:id',checkAuth(...Object.values(Role)), ParcelController.getParcelById);

// Sender routes
router.get('/sent', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.SENDER), ParcelController.getMySentParcels);
router.patch('/cancel/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.SENDER), ParcelController.cancelParcel);

// Receiver routes
router.get('/received', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.RECEIVER), ParcelController.getMyReceivedParcels);
router.patch('/confirm-delivery/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.RECEIVER), ParcelController.confirmDelivery);

// Super Admin and Admin routes
router.get('/all', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.getAllParcels);
router.patch('/status/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.updateParcelStatus);
router.patch('/block/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.blockParcel);
router.patch('/unblock/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.unblockParcel);
router.get('/admin/statistics', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ParcelController.getParcelStatistics);

export const ParcelRoutes = router;
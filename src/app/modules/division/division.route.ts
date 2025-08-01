// division.route.ts
import { Router } from 'express';
// Assuming you have role middleware
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from '../user/user.interface';
import { DivisionController } from './division.controller';

const router = Router();


// Admin only routes
router.post('/register', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DivisionController.createDivision);
router.put('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DivisionController.updateDivision);
router.delete('/:id', checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DivisionController.deleteDivision);

// Public routes (for getting divisions when creating parcels)
router.get('/', DivisionController.getAllDivisions);
router.get('/:id', DivisionController.getDivisionById);

export const DivisionRoutes = router;
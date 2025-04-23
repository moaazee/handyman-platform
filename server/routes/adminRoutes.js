import express from 'express';
import {
  getAllUsers,
  deleteUser,
  getAllBookings,
  deleteBooking,
  getAnalytics,
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin routes (protected by role on frontend only)
router.get('/users', verifyToken, getAllUsers);
router.delete('/users/:id', verifyToken, deleteUser);

router.get('/bookings', verifyToken, getAllBookings);
router.delete('/bookings/:id', verifyToken, deleteBooking);
router.get("/analytics", verifyToken, getAnalytics);

export default router;

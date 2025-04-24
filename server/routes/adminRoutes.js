import express from 'express';
import {
  getAllUsers,
  deleteUser,
  getAllBookings,
  deleteBooking,
  getAnalytics,
  downloadUsersCSV,
  downloadBookingsCSV
} from '../controllers/adminController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/users', verifyToken, getAllUsers);
router.delete('/users/:id', verifyToken, deleteUser);

router.get('/bookings', verifyToken, getAllBookings);
router.delete('/bookings/:id', verifyToken, deleteBooking);

router.get('/analytics', verifyToken, getAnalytics);

router.get('/export/users', verifyToken, downloadUsersCSV);
router.get('/export/bookings', verifyToken, downloadBookingsCSV);

export default router;

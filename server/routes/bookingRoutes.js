import express from 'express';
import {
  createBooking,
  getBookings,
  cancelBooking,
  rescheduleBooking
} from '../controllers/bookingController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createBooking);
router.get('/', verifyToken, getBookings);
router.delete('/:id', verifyToken, cancelBooking);           // cancel booking
router.put('/reschedule/:id', verifyToken, rescheduleBooking); // reschedule booking

export default router;

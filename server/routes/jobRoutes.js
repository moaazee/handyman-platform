import express from 'express';
import {
  createJob,
  getAllJobs,
  getMyJobs,
  rescheduleJob,
  updateJob,
  cancelJob,
} from '../controllers/jobController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createJob);            // Customer creates job
router.get('/', verifyToken, getAllJobs);            // Provider sees all jobs
router.get('/me', verifyToken, getMyJobs);           // Customer sees their jobs
router.put('/reschedule/:jobId', verifyToken, rescheduleJob);  // Reschedule job
router.put('/:jobId', verifyToken, updateJob);       // Customer updates job
router.put('/cancel/:jobId', verifyToken, cancelJob); // Cancel job

export default router;

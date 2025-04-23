import express from 'express';
import { createJob, getAllJobs, getMyJobs } from '../controllers/jobController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createJob);       // Customer creates job
router.get('/', verifyToken, getAllJobs);       // Provider sees all jobs
router.get('/me', verifyToken, getMyJobs);      // Customer sees their jobs

export default router;

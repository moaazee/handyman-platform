import express from 'express';
import { createService, getAllServices } from '../controllers/serviceController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAllServices);
router.post('/', verifyToken, createService);

export default router;

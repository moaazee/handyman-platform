import express from 'express';
import { getUserDiscount } from '../controllers/userController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/discount', verifyToken, getUserDiscount);

export default router;

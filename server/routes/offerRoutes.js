import express from 'express';
import {
  createOffer,
  getOffersForJob,
  acceptOffer
} from '../controllers/offerController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createOffer);                // POST /offers
router.get('/job/:jobId', verifyToken, getOffersForJob);  // GET /offers/job/:jobId
router.post('/accept/:offerId', verifyToken, acceptOffer); // POST /offers/accept/:offerId

export default router;

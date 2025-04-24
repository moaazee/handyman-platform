import express from 'express';
import {
  createOffer,
  getOffersForJob,
  acceptOffer,
  getMyOffers,  
} from '../controllers/offerController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, createOffer);                    // Create a new offer
router.get('/job/:jobId', verifyToken, getOffersForJob);      // Get all offers for a job
router.post('/accept/:offerId', verifyToken, acceptOffer);    // Accept an offer
router.get('/my', verifyToken, getMyOffers);                  //  Get offers made by logged-in provider

export default router;

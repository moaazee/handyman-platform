import { PrismaClient } from "@prisma/client";
import { getCustomerDiscount } from "../utils/discountHelper.js";

const prisma = new PrismaClient();

// Create an offer
export const createOffer = async (req, res) => {
  const { message, price, available, jobRequestId } = req.body;

  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: "Only providers can make offers" });
  }

  try {
    const offer = await prisma.offer.create({
      data: {
        message,
        price: parseFloat(price),
        available: new Date(available),
        jobRequestId: parseInt(jobRequestId),
        providerId: req.user.id,
      },
    });
    res.json(offer);
  } catch (err) {
    console.error("Create offer failed:", err);
    res.status(500).json({ error: "Failed to create offer" });
  }
};

// Get all offers for a job (for the customer)
export const getOffersForJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    const offers = await prisma.offer.findMany({
      where: { jobRequestId: parseInt(jobId) },
      include: {
        provider: true,
        jobRequest: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(offers);
  } catch (err) {
    console.error("Failed to fetch offers:", err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
};

// Accept an offer and create a booking with discount applied
export const acceptOffer = async (req, res) => {
  const { offerId } = req.params;

  try {
    const offer = await prisma.offer.findUnique({
      where: { id: parseInt(offerId) },
      include: {
        provider: true,
        jobRequest: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!offer) return res.status(404).json({ error: "Offer not found" });

    const user = offer.jobRequest.user;
    const discount = getCustomerDiscount(user.subscriptionStart);
    const finalPrice = offer.price * (1 - discount / 100);

    const booking = await prisma.booking.create({
      data: {
        customer: user.name,
        bookedAt: new Date(),
        price: finalPrice,
        serviceId: 0, // Update if needed
        userId: user.id,
      },
    });

    res.json({
      message: `Offer accepted. Final price after ${discount}% discount: DKK ${finalPrice.toFixed(2)}`,
      booking,
    });
  } catch (err) {
    console.error("Accept offer failed:", err);
    res.status(500).json({ error: "Failed to accept offer" });
  }
};

// Get all offers made by the logged-in provider (for Provider Dashboard)
export const getMyOffers = async (req, res) => {
  try {
    console.log("Provider ID:", req.user.id); 
    const offers = await prisma.offer.findMany({
      where: { providerId: req.user.id },
      include: { jobRequest: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(offers);
  } catch (err) {
    console.error("Failed to fetch provider's offers:", err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
};

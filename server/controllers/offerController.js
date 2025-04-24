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
            offers: true,
          },
        },
      },
    });

    if (!offer) return res.status(404).json({ error: "Offer not found" });

    // Check if an offer is already accepted for this job
    const alreadyAccepted = await prisma.offer.findFirst({
      where: {
        jobRequestId: offer.jobRequestId,
        accepted: true,
      },
    });

    if (alreadyAccepted) {
      return res.status(400).json({ error: "An offer has already been accepted for this job." });
    }

    const user = offer.jobRequest.user;
    const discount = getCustomerDiscount(user.subscriptionStart);
    const finalPrice = offer.price * (1 - discount / 100);

    // Create booking (allowing serviceId to be optional/null)
    const booking = await prisma.booking.create({
      data: {
        customer: user.name,
        bookedAt: new Date(),
        price: finalPrice,
        serviceId: null,
        userId: user.id,
      },
    });

    // Mark the selected offer as accepted
    await prisma.offer.update({
      where: { id: offer.id },
      data: { accepted: true },
    });

    // Lock all other offers for this job
    await prisma.offer.updateMany({
      where: {
        jobRequestId: offer.jobRequestId,
        NOT: { id: offer.id },
      },
      data: { locked: true },
    });

    // Mark the job as taken
    await prisma.jobRequest.update({
      where: { id: offer.jobRequestId },
      data: { taken: true },
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

// Get all offers made by the logged-in provider
export const getMyOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { providerId: req.user.id },
      include: {
        jobRequest: {
          include: { user: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(offers);
  } catch (err) {
    console.error("Failed to fetch provider's offers:", err);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
};

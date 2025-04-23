import { PrismaClient } from "@prisma/client";
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

// Accept an offer and create a booking
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

    const booking = await prisma.booking.create({
      data: {
        customer: offer.jobRequest.user.name,
        bookedAt: new Date(),
        serviceId: 0, // Placeholder — you can replace this with a dynamic serviceId if needed
        userId: offer.jobRequest.userId,
      },
    });

    res.json({ message: "Offer accepted. Booking created.", booking });
  } catch (err) {
    console.error("Accept offer failed:", err);
    res.status(500).json({ error: "Failed to accept offer" });
  }
};

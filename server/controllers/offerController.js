import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create an offer
export const createOffer = async (req, res) => {
  const { message, price, available, jobRequestId } = req.body;

  // Find the job request to check if it's already taken or cancelled
  const jobRequest = await prisma.jobRequest.findUnique({
    where: { id: parseInt(jobRequestId) },
  });

  if (!jobRequest) {
    return res.status(404).json({ error: "Job request not found" });
  }

  // Prevent new offers if the job is already taken or cancelled
  if (jobRequest.taken || jobRequest.cancelled) {
    return res.status(400).json({ error: "This job is no longer available" });
  }

  // Create the offer
  try {
    const newOffer = await prisma.offer.create({
      data: {
        message,
        price,
        available: new Date(available),
        jobRequestId: parseInt(jobRequestId),
        providerId: req.user.id,
      },
    });

    res.json(newOffer);
  } catch (err) {
    console.error("Failed to create offer:", err);
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

    if (!offer) {
      console.error("Offer not found");
      return res.status(404).json({ error: "Offer not found" });
    }

    // Check if the job has already been taken
    if (offer.jobRequest.taken) {
      console.error("This job has already been taken");
      return res.status(400).json({ error: "This job has already been taken" });
    }

    // Check if an offer has already been accepted for this job
    const existingAcceptedOffer = await prisma.offer.findFirst({
      where: {
        jobRequestId: offer.jobRequestId,
        accepted: true,
      },
    });

    if (existingAcceptedOffer) {
      console.error("An offer has already been accepted for this job.");
      return res.status(400).json({ error: "An offer has already been accepted for this job." });
    }

    // Create booking (allowing serviceId to be optional/null)
    const booking = await prisma.booking.create({
      data: {
        customer: offer.jobRequest.user.name,
        bookedAt: new Date(),
        price: offer.price,
        serviceId: null,
        userId: offer.jobRequest.user.id,
      },
    });

    // Mark the selected offer as accepted and closed
    await prisma.offer.update({
      where: { id: parseInt(offerId) },
      data: { accepted: true, closed: true },
    });

    // Lock all other offers for this job
    await prisma.offer.updateMany({
      where: {
        jobRequestId: offer.jobRequestId,
        NOT: { id: parseInt(offerId) },
      },
      data: { closed: true },
    });

    // Mark the job as taken
    await prisma.jobRequest.update({
      where: { id: offer.jobRequestId },
      data: { taken: true },
    });

    console.log(`Offer accepted for job: ${offer.jobRequest.title}.`);

    res.json({
      message: `Offer accepted. Final price: DKK ${offer.price}`,
      booking,
    });
  } catch (err) {
    console.error("Error accepting offer:", err);
    res.status(500).json({ error: "Failed to accept offer" });
  }
};

// Get all offers made by the logged-in provider
export const getMyOffers = async (req, res) => {
  try {
    const offers = await prisma.offer.findMany({
      where: {
        providerId: req.user.id,
        jobRequest: {
          cancelled: false,
        },
      },
      include: {
        jobRequest: {
          include: { user: true },
        },
      },
    });

    res.json(offers);
  } catch (err) {
    console.error("Failed to get provider offers:", err);
    res.status(500).json({ error: "Failed to load offers" });
  }
};

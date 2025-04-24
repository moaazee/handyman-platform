import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/services - For guests (non-authenticated users) and providers
export const getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// POST /api/services - For authenticated providers only
export const createService = async (req, res) => {
  const { title, category, description, image } = req.body;

  // Ensure only providers can create services
  if (req.user.role !== 'provider') {
    return res.status(403).json({ error: "Only providers can create services" });
  }

  try {
    const newService = await prisma.service.create({
      data: {
        title,
        category,
        description,
        image,
        userId: req.user.id,
      },
    });
    res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
};

// GET /api/services (no authentication required) - For guests (non-authenticated users)
export const getServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        user: true, // Show the user who offered the service, if necessary
      },
    });
    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ error: "Failed to fetch services" });
  }
};

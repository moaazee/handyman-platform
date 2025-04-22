import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/services
export const getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

// POST /api/services
export const createService = async (req, res) => {
  const { title, category, description, image } = req.body;

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


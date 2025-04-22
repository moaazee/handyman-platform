import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

export const createService = async (req, res) => {
  const { title, category, description, image } = req.body;

  if (!title || !category || !description) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newService = await prisma.service.create({
      data: {
        title,
        category,
        description,
        image,
        userId: req.user.id
      }
    });

    res.status(201).json(newService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
};

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create a job request
export const createJob = async (req, res) => {
  const { title, category, description, image, location, deadline } = req.body;

  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: "Only customers can create job requests" });
  }

  try {
    const job = await prisma.jobRequest.create({
      data: {
        title,
        category,
        description,
        image,
        location,
        deadline: new Date(deadline),
        userId: req.user.id,
      },
    });
    res.json(job);
  } catch (err) {
    console.error("Create job failed:", err);
    res.status(500).json({ error: "Failed to create job request" });
  }
};

// Get all job requests (for providers to browse)
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.jobRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (err) {
    console.error("Fetch jobs failed:", err);
    res.status(500).json({ error: "Failed to get job requests" });
  }
};

// Get current customer's job requests
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await prisma.jobRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(jobs);
  } catch (err) {
    console.error("Fetch my jobs failed:", err);
    res.status(500).json({ error: "Failed to get your job requests" });
  }
};

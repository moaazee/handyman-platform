import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Create a job request
export const createJob = async (req, res) => {
  const { title, category, description, image, location, deadline } = req.body;

  if (req.user.role !== "customer") {
    return res.status(403).json({ error: "Only customers can create job requests" });
  }

  if (!title || !category || !description || !location || !deadline) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const job = await prisma.jobRequest.create({
      data: {
        title,
        category,
        description,
        image: image || null,
        location,
        deadline: new Date(deadline),
        userId: req.user.id,
      },
    });
    console.log("✅ Job created:", job.id);
    res.status(201).json(job);
  } catch (err) {
    console.error("❌ Create job failed:", err);
    res.status(500).json({ error: "Failed to create job request" });
  }
};

// Get all job requests (for providers)
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.jobRequest.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (err) {
    console.error("❌ Fetch all jobs failed:", err);
    res.status(500).json({ error: "Failed to get job requests" });
  }
};

// Get job requests posted by current customer
export const getMyJobs = async (req, res) => {
  try {
    const jobs = await prisma.jobRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (err) {
    console.error("❌ Fetch my jobs failed:", err);
    res.status(500).json({ error: "Failed to get your job requests" });
  }
};

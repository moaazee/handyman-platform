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
      where: { cancelled: false } // Only fetch jobs that are not canceled
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
      where: { userId: req.user.id, cancelled: false }, // Only get non-cancelled jobs
      orderBy: { createdAt: "desc" },
    });
    res.json(jobs);
  } catch (err) {
    console.error("❌ Fetch my jobs failed:", err);
    res.status(500).json({ error: "Failed to get your job requests" });
  }
};

// Reschedule a job
export const rescheduleJob = async (req, res) => {
  const { jobId } = req.params;
  const { newDate } = req.body;

  try {
    const updatedJob = await prisma.jobRequest.update({
      where: { id: parseInt(jobId) },
      data: { deadline: new Date(newDate) },
    });

    res.json({ message: "Job rescheduled successfully", job: updatedJob });
  } catch (error) {
    console.error("Error rescheduling job:", error);
    res.status(500).json({ error: "Failed to reschedule job" });
  }
};

// Update job details
export const updateJob = async (req, res) => {
  const { jobId } = req.params;
  const { title, category, description, location, deadline } = req.body;

  try {
    const updatedJob = await prisma.jobRequest.update({
      where: { id: parseInt(jobId) },
      data: { title, category, description, location, deadline: new Date(deadline) },
    });

    res.json({ message: "Job updated successfully", job: updatedJob });
  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
};

export const cancelJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    // Cancel the job
    const job = await prisma.jobRequest.update({
      where: { id: parseInt(jobId) },
      data: { cancelled: true },
    });

    // Close all offers associated with this job
    await prisma.offer.updateMany({
      where: { jobRequestId: parseInt(jobId) },
      data: { closed: true }, // Close the offers for the cancelled job
    });

    res.json({ message: "Job cancelled", job });
  } catch (err) {
    console.error("❌ Cancel job failed:", err);
    res.status(500).json({ error: "Failed to cancel job" });
  }
};

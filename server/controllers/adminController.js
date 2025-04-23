import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (err) {
    console.error("Admin: get users failed", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Admin: delete user failed", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        service: true,
        user: true,
      },
      orderBy: { bookedAt: 'desc' },
    });
    res.json(bookings);
  } catch (err) {
    console.error("Admin: get bookings failed", err);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// Delete booking
export const deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.booking.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Booking deleted" });
  } catch (err) {
    console.error("Admin: delete booking failed", err);
    res.status(500).json({ error: "Failed to delete booking" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalCustomers = await prisma.user.count({ where: { role: "customer" } });
    const totalProviders = await prisma.user.count({ where: { role: "provider" } });

    const totalBookings = await prisma.booking.count();
    const cancelledBookings = await prisma.booking.count({ where: { status: "cancelled" } });
    const activeBookings = totalBookings - cancelledBookings;

    const revenue = await prisma.booking.aggregate({
      _sum: { price: true },
      where: { status: "active" },
    });

    res.json({
      totalUsers,
      totalCustomers,
      totalProviders,
      totalBookings,
      activeBookings,
      cancelledBookings,
      revenue: revenue._sum.price || 0,
    });
  } catch (err) {
    console.error("Admin analytics failed:", err);
    res.status(500).json({ error: "Failed to load analytics" });
  }
};

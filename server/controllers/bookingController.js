import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create booking
export const createBooking = async (req, res) => {
  const { customer, serviceId } = req.body;

  if (req.user.role !== 'customer') {
    return res.status(403).json({ error: "Only customers can create bookings" });
  }

  try {
    const newBooking = await prisma.booking.create({
      data: {
        customer,
        serviceId: parseInt(serviceId),
        userId: req.user.id,
      },
      include: { service: true },
    });
    res.json(newBooking);
  } catch (err) {
    console.error("Create booking failed:", err);
    res.status(500).json({ error: "Failed to create booking" });
  }
};

// Get all bookings for the logged-in user
export const getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        service: true,
      },
      orderBy: { bookedAt: 'desc' },
    });
    res.json(bookings);
  } catch (err) {
    console.error('Get bookings failed:', err);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

// Cancel a booking by updating status
export const cancelBooking = async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: "cancelled" },
    });
    res.json({ message: "Booking cancelled", booking });
  } catch (err) {
    console.error("Cancel booking failed:", err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
};

// Reschedule a booking
export const rescheduleBooking = async (req, res) => {
  const { id } = req.params;
  const { newDate } = req.body;

  try {
    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        bookedAt: new Date(newDate),
        rescheduledAt: new Date(),
      },
    });
    res.json({ message: "Booking rescheduled", booking });
  } catch (err) {
    console.error("Reschedule failed:", err);
    res.status(500).json({ error: "Failed to reschedule booking" });
  }
};

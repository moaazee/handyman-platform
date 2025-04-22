import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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


export const getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        service: true,
      },
    });
    res.json(bookings);
  } catch (err) {
    console.error('Get bookings failed:', err);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

export const deleteBooking = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.booking.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    console.error('Delete booking failed:', err);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
};

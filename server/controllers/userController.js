import { PrismaClient } from '@prisma/client';
import { getCustomerDiscount } from '../utils/discountHelper.js';

const prisma = new PrismaClient();

export const getUserDiscount = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) return res.status(404).json({ error: "User not found" });

    const discount = getCustomerDiscount(user.subscriptionStart);
    res.json({ discount });
  } catch (err) {
    console.error("Discount fetch error:", err);
    res.status(500).json({ error: "Could not fetch discount" });
  }
};

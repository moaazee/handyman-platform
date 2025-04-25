import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from './routes/jobRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();

// Allow CORS 
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // if using cookies
}));

app.use(express.json());

// Routes
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

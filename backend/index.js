import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurant.js';
import manageRestaurantRoutes from './routes/manageRestaurant.js';
import profileRoutes from './routes/profile.js'; // Add this import

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/manage-restaurants', manageRestaurantRoutes);
app.use('/api/profile', profileRoutes); 

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Food Ordering API is running!' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
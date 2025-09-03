import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import restaurantRoutes from './routes/restaurant.js';
import manageRestaurantRoutes from './routes/manageRestaurant.js';
import profileRoutes from './routes/profile.js';
import restaurantManagementRoutes from './routes/restaurantManagement.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  //origin: ['http://localhost:5173','https://food-order-app-3fbj-git-main-nazifs-projects-289e8cd8.vercel.app/'],
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/manage-restaurants', manageRestaurantRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders',orderRoutes);


// Add this line with other route imports
app.use('/api/restaurant-management', restaurantManagementRoutes);


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
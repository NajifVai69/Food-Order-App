import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./utils/db.js"


import restaurantRoutes from './routes/restaurantRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { errorHandler } from "./middlewares/errorHandler.js"

const app=express()
app.use(express.json())

app.use(express.urlencoded({extended:true}))
const corsOptions={
    origin: 'http//localhost:1484',
    credentials: true
}
app.use(cors(corsOptions))
app.use(cookieParser())

dotenv.config({})

// API Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/users', userRoutes);


app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Welcome to Food Ordering API",
        version: "1.0.0",
        endpoints: {
            restaurants: "/api/restaurants",
            ratings: "/api/ratings", 
            users: "/api/users",
            health: "/api/health"
        }
    });
});


const port= process.env.PORT || 1484

app.get("/", (req, res) => {
  return res.status(200).json({
    message:"I am coming from backend",
    success:true
  })
});


// Error handler middleware

app.listen(port,()=>{
    connectDB()
    console.log(`Server running at port ${port}`)

})
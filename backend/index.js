import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./utils/db.js"

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
const port= process.env.PORT || 1484

app.get("/", (req, res) => {
  return res.status(200).json({
    message:"I am coming from backend",
    success:true
  })
});
app.listen(port,()=>{
    connectDB()
    console.log(`Server running at port ${port}`)

})
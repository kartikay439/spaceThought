import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import rateLimit from "express-rate-limit";


const userLimiter = rateLimit(
   {
      windowMs:5000,
      max:1,
      message:"Too many request",
      standardHeaders:true,
      legacyHeaders:false
   }
)


dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// app.use(userLimiter);


app.use("/api/auth", authRoutes);
app.post("/", (req, res) => {
   console.log(req.body);
   res.json({
      message: "Welcome to the server!",
      idea: "Welcome to the space",
   }).status(200)
})
app.use("/api/post", postRoutes);


const PORT = 5000;
app.listen(process.env.PORT||PORT, () => console.log(`🚀 Server running on port ${PORT}`));

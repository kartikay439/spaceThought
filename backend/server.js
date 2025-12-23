import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import rateLimit from "express-rate-limit";

import userRoutes from "./routes/userRoutes.js";


// const userLimiter = rateLimit(
//    {
//       windowMs:5000,
//       max:1,
//       message:"Too many request",
//       standardHeaders:true,
//       legacyHeaders:false
//    }
// )


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
app.use("/api/user",userRoutes);

const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on 0.0.0.0:5000");
});

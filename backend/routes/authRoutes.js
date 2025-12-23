import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiResponse from "../utility/ApiResponse.js"

const router = express.Router();
// app.set('trust proxy', 1) // trust first proxy


// Register User
router.get("/isLogin", async (req, res) => {
    const token = req.headers.authorization;
    console.log("token : " + token);
    try {
        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) return res.status(401).json({ message: "Unauthorized" });
        console.log(decodedToken);
        const user = await User.findById(decodedToken.id)

        const data = {

        }

        return res.status(200).json(new ApiResponse(200, "User already logged in", data));

    } catch (error) {
        const data = {

        }
        return res.status(401).json(new ApiResponse(401, "Unauthorized", data));
    }

})



router.post("/signup", async (req, res) => {
    
    console.log(req.body);


    const { name, email, password } = req.body;

    try {


        let user = await User.findOne({ email });
        if (user) {
            let data = {

            }
            
            return res.status(400).json(new ApiResponse(400, "User already exists", data));
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ name, email, password: hashedPassword });
        await user.save();


        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        let data = {
            token
        }
        res.status(201).json(new ApiResponse(201, "user created successfully", data));

    } catch (err) {
        console.log(err.message);
        let data = {
        }
        res.status(500).json(new ApiResponse(500, "Server error", data));
    }
});





// 🔹 Login User API
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    try {
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        console.log(token);
        let data = {
            token
        }
        res.status(200).json(new ApiResponse(200, "login successful", data));


    } catch (err) {
        let data = {
        }
        res.status(500).json(new ApiResponse(500, "Server error", data));
    }
});



export default router;

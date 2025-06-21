import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiResponse from "../utility/ApiResponse.js"

const router = express.Router();
// app.set('trust proxy', 1) // trust first proxy


// Register User
router.post("/signup", async (req, res) => {
    console.log(req.body);
    const {name, email, password} = req.body;
    try {
        let user = await User.findOne({email});

        //Standard Error FORMAT : res.status(400).json({message: "User already exists"});
        if (user) return res.status(400).json({message: "User already exists"});

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({name, email, password: hashedPassword});
        await user.save();


        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        res.status(201).json(new ApiResponse(201,"user created successfully",{token}));
    } catch (err) {
        console.log(err.message)
        res.status(500).json({message: "Server error occur"});
    }
});

// 🔹 Login User API
router.post("/login", async (req, res) => {
    const {email, password} = req.body;
    console.log(req.body);
    try {
        const user = await User.findOne({email});

        if (!user) return res.status(400).json({message: "User not found"});

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(password,user.password);
        if (!isMatch) return res.status(400).json({message: "Invalid credentials"});

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: "1h"});
        console.log(token)

        res.json({
                token,
                message: "hi"
            }
        );
    } catch (err) {
        res.status(500).json({message: "Server error"});
    }
});

router.get("/isLogin", async (req, res) => {
    const token = req.headers.authorization;
    console.log("token : "+token);
    try {
           const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) return res.status(401).json({message: "Unauthorized"});
    console.log(decodedToken);
    const user = await User.findById(decodedToken.id)
    return res.status(200).json(
        user
    ) 
    } catch (error) {
        return res.status(401).json({message: "Token Expired"});
    }

})


export default router;

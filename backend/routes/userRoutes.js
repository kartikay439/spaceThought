import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import ApiResponse from "../utility/ApiResponse.js";

const router = express.Router();

// 🔹 Get User Profile
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        let data = {
            name: user.name,
            email: user.email,
        }
        console.log("user id",req.user.id,data);
        res.status(200).json(new ApiResponse(200,"User profile fetched successfully", data));
    } catch (err) {
        console.log("Error fetching user profile:", err);
        res.status(500).json(new ApiResponse(200,"Server error", null));
    }
});

// 🔹 Update User Profile
router.put("/profile", authMiddleware, async (req, res) => {
    try {
        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true }).select("-password");
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});


// 🔹 Delete User Profile
router.delete("/profile", authMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

export default router;

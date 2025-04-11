import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import Post from "../models/Post.js";
import { uploadOnCloudinary } from "../utility/cloudinary.js";
import {requestMiddleware} from "../middleware/requestMiddleware.js";

const router = express.Router();

// 🔹 Create Post
router.post("/create", authMiddleware, async (req, res) => {
    try {
        const { text, mediaUrl } = req.body;
        if (!text || !mediaUrl) {
            return res.status(400).json({ message: "Text and Media are required" });
        }

        const newPost = new Post({
            user: req.user.id,
            text,
            mediaUrl,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ message: "Server error" });
    }
});



router.post("/upload", upload.single("thoughtMedia"), async (req, res) => {
    try {
        console.log("🔹 Received Headers:", req.headers);
        console.log("🔹 Received Body:", req.body);
        console.log("🔹 Received File:", req.file);

        if (!req.file) {
            console.log("file not exist")
            return res.status(400).json({ message: "No file uploaded" });
        }

        console.log("📸 Uploaded File:", req.file);
        console.log("📝 Thought Text:", req.body.thought);

        const thoughtMediaPath = req.file.path;
        const thoughtMediaOnCloudinary = await uploadOnCloudinary(thoughtMediaPath);

        if (!thoughtMediaOnCloudinary || !thoughtMediaOnCloudinary.url) {
            return res.status(500).json({ message: "❌ Cloudinary upload failed" });
        }

        const thoughtMediaOnCloudinaryUrl = thoughtMediaOnCloudinary.url;
        console.log("✅ Cloudinary URL:", thoughtMediaOnCloudinaryUrl);

        if (!req.body.thought) {
            return res.status(400).json({ message: "❌ Thought text is required" });
        }

        const post = await Post.create({
            thought: req.body.thought,
            thoughtMedia: [thoughtMediaOnCloudinaryUrl],
        });

        return res.status(201).json({
            message: "✅ Post successfully uploaded",
            post,
        });
    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});



// 🔹 Get All Posts
router.get("/all",
    requestMiddleware
    ,async (req, res) => {
    try {
        const posts = await Post.find({


        });
        res.status(203).json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500)
    }
});

export default router;

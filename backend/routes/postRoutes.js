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



router.post("/upload",requestMiddleware ,upload.single("thoughtMedia"), async (req, res) => {
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
        console.log("iddddddddddddddddddddddddddddddddd"+req.id)


        const post = await Post.create({
            thought: req.body.thought,
            thoughtMedia: [thoughtMediaOnCloudinaryUrl],
            userID:req.id
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



router.get("/all", requestMiddleware, async (req, res) => {
  try {
    const posts = await Post.aggregate([
  // ✅ Step 0: Match only posts with a valid userID format (24-char hex strings)
  {
    $match: {
      userID: { $type: "string", $regex: /^[a-f\d]{24}$/i }
    }
  },
  // ✅ Step 1: Convert userID to ObjectId
  {
    $addFields: {
      userObjId: { $toObjectId: "$userID" }
    }
  },
  // ✅ Step 2: Lookup user info
  {
    $lookup: {
      from: "users",
      localField: "userObjId",
      foreignField: "_id",
      as: "userInfo"
    }
  },
  // ✅ Step 3: Unwind and project
  { $unwind: "$userInfo" },
  {
    $project: {
      _id: 1,
      thought: 1,
      thoughtMedia: 1,
      username: "$userInfo.name"
    }
  }
]);

console.log(posts)
    res.status(200).json(posts);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default router;

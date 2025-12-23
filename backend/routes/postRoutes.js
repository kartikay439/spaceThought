import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import Post from "../models/Post.js";
import { uploadOnCloudinary } from "../utility/cloudinary.js";
import {requestMiddleware} from "../middleware/requestMiddleware.js";
import { ObjectId } from 'mongodb';
import ApiResponse from "../utility/ApiResponse.js";

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
            return res.status(500).json(new ApiResponse(500, "❌ Cloudinary upload failed",{}));
        }

        const thoughtMediaOnCloudinaryUrl = thoughtMediaOnCloudinary.url;
        console.log("✅ Cloudinary URL:", thoughtMediaOnCloudinaryUrl);

        if (!req.body.thought) {
            return res.status(400).json(new ApiResponse);
        }
        console.log("iddddddddddddddddddddddddddddddddd"+req.id)


        const post = await Post.create({
            thought: req.body.thought,
            thoughtMedia: [thoughtMediaOnCloudinaryUrl],
            userID:req.id
        });

        return res.status(201).json(new ApiResponse(201, "✅ Post created successfully", {}));
    } catch (error) {
        console.error("❌ Upload Error:", error);
        res.status(500).json(new ApiResponse(500,"Backend Error",{}));
    }
});



router.get("/all", async (req, res) => {
  try {
    const { cursor, limit = 10 } = req.query;
    const parsedLimit = parseInt(limit, 10);

    console.log("🔹 Query:", req.query);

    // ✅ NO user filter → fetch all posts
    const matchStage = {};

    // Cursor pagination
    if (cursor) {
      matchStage._id = { $lt: new ObjectId(cursor) };
    }

    const posts = await Post.aggregate([
      { $match: matchStage },

      // convert string userID → ObjectId
      {
        $addFields: {
          userObjId: { $toObjectId: "$userID" }
        }
      },

      // join users collection
      {
        $lookup: {
          from: "users",
          localField: "userObjId",
          foreignField: "_id",
          as: "userInfo"
        }
      },

      // flatten
      { $unwind: "$userInfo" },

      // project required fields
      {
        $project: {
          _id: 1,
          thought: 1,
          thoughtMedia: 1,
          username: "$userInfo.name"
        }
      },

      // newest first
      { $sort: { _id: -1 } },

      // pagination (+1 trick)
      { $limit: parsedLimit + 1 }
    ]);

    // cursor logic
    const hasNext = posts.length > parsedLimit;
    if (hasNext) posts.pop();

    const nextCursor = hasNext
      ? posts[posts.length - 1]._id
      : null;

    res.status(200).json({
      posts,
      nextCursor
    });

  } catch (err) {
    console.error("❌ Aggregation error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;





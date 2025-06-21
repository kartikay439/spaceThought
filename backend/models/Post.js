import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    userID:String,
    thought:String,
    thoughtMedia:[],
});

export default mongoose.model("Post", PostSchema);

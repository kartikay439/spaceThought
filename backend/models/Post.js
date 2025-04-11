import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
    thought:String,
    thoughtMedia:[],
});

export default mongoose.model("Post", PostSchema);

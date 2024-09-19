import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    username: { type: String, required: true },
    profilePhoto: { type: String, required: true },
    desc: { type: String },
    img: { type: String },
    likes: { type: Array, default: [] },
    comments: [
      {
        userId: String,
        username: String,
        profilePhoto: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);



export default mongoose.model("Post", PostSchema);

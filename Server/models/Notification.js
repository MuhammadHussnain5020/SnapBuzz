import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {
    // The user who will receive the notification
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true },
    profilePhoto: { type: String, required: true },
  },
  type: {
    type: String,
    enum: ["follow", "unfollow", "like", "dislike", "comment"],
    required: true,
  },
  fromUser: {
    // The user who triggered the notification
    _id: mongoose.Schema.Types.ObjectId,
    username: { type: String, required: true },
    profilePhoto: { type: String, required: true },
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // Optional, only for like/dislike
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);

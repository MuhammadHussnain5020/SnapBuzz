import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  profilePhoto: {
    type: String,
    default: "uploads/images.png",
  },
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  following: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  postCount: {
    type: Number,
    default: 0, // Initialize with 0 posts
  },
  lastPostDate: {
    type: Date,
    default: null, // Optional field to track the date of the last post
  },
  stripeCustomerId: { type: String }, // Added for Stripe integration
});

userSchema.methods.incrementPostCount = async function () {
  this.postCount += 1;
  this.lastPostDate = new Date();
  await this.save();
};


export default mongoose.model("User", userSchema);

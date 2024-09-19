import express from "express";
import mongoose from "mongoose";
import Post from "../models/post.js";
import User from "../models/user.js";
import Notification from "../models/Notification.js";
import upload from "../utils/upload.js";
import auth from "../utils/auth.js";
import Subscription  from "../models/Subscription.js";

const router = express.Router();

// Create a post with image upload
// Create a post with image upload and post limits
// Create a post with image upload and post limits
router.post("/", upload.single("img"), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    const { userId, username, profilePhoto, desc } = req.body;

    // Find the user and their subscription
    const user = await User.findById(userId);
    console.log("Found user:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const subscription = await Subscription.findOne({ user: userId });
    if (!subscription) {
      return res.status(400).json({ error: "Subscription not found" });
    }

    // Check if the user has reached their post limit
    if (subscription.postCount >= subscription.postLimit && subscription.postLimit !== Infinity) {
      subscription.status = "inactive"; // Mark the subscription as inactive if post limit is reached
      await subscription.save();
      return res.status(403).json({ error: "Post limit reached. Upgrade your plan." });
    }

    // Create a new post
    const newPost = new Post({
      userId,
      username,
      profilePhoto,
      desc,
      img: req.file ? req.file.filename : "", // Attach the uploaded image filename
    });

    console.log("New post object:", newPost);

    const savedPost = await newPost.save();
    console.log("Saved post:", savedPost);

    // Increment post count in the subscription
    subscription.postCount += 1;
    await subscription.save();
    console.log("Post count incremented in subscription");

    // Increment post count for the user
    await user.incrementPostCount(); // Increment post count and update last post date in the User schema
    console.log("Post count incremented for user");

    res.status(200).json(savedPost);
  } catch (err) {
    console.error("Error in post route:", err);
    res.status(500).json({ error: "Error saving the post", details: err.message });
  }
});


// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: "Error fetching posts", details: err });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json("Post not found");
    }
  } catch (err) {
    res.status(500).json({ error: "Error fetching the post", details: err });
  }
});

// Update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("The post has been updated");
    } else {
      res.status(403).json("You can update only your post");
    }
  } catch (err) {
    res.status(500).json({ error: "Error updating the post", details: err });
  }
});

// Delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("The post has been deleted");
    } else {
      res.status(403).json("You can delete only your post");
    }
  } catch (err) {
    res.status(500).json({ error: "Error deleting the post", details: err });
  }
});

// Like / Dislike a post and create/remove notifications
router.put("/:id/like", auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.body.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isLiked = post.likes.includes(userId);

    if (!isLiked) {
      await post.updateOne({ $push: { likes: userId } });

      const newNotification = new Notification({
        user: {
          _id: post.userId,
          username: post.username,
          profilePhoto: post.profilePhoto,
        },
        type: "like",
        fromUser: {
          _id: user._id,
          username: user.username,
          profilePhoto: user.profilePhoto,
        },
        post: post._id,
      });

      await newNotification.save();

      res.status(200).json("The post has been liked and notification created");
    } else {
      await post.updateOne({ $pull: { likes: userId } });

      await Notification.findOneAndDelete({
        "user._id": post.userId,
        "fromUser._id": userId,
        type: "like",
        post: post._id,
      });

      res
        .status(200)
        .json("The post has been disliked and notification removed");
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error liking/disliking the post", details: err });
  }
});

// Get like status of a post for a specific user
router.get("/:id/like-status", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const liked = post.likes.includes(userId);
    res.status(200).json({ liked });
  } catch (err) {
    res.status(500).json({ error: "Error fetching like status", details: err });
  }
});

// Get posts for a specific user
router.get("/:id/posts", async (req, res) => {
  try {
    const userPosts = await Post.find({ userId: req.params.id });
    res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json({ error: "Error fetching user posts", details: err });
  }
});

// Add a comment to a post
router.post("/:postId/comments", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const newComment = {
      userId: req.user.userId,
      username: req.body.username,
      profilePhoto: req.body.profilePhoto,
      text: req.body.text,
    };

    post.comments.push(newComment);
    await post.save();

    // Create a notification for the post owner
    if (post.userId.toString() !== req.user.userId.toString()) {
      const newNotification = new Notification({
        user: {
          _id: post.userId,
          username: post.username,
          profilePhoto: post.profilePhoto,
        },
        type: "comment",
        fromUser: {
          _id: req.user.userId,
          username: req.body.username,
          profilePhoto: req.body.profilePhoto,
        },
        post: post._id,
      });

      await newNotification.save();
    }

    res.status(201).json(post.comments);
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Error adding comment", details: err });
  }
});

// Fetch comments for a specific post
router.get("/:postId/comments", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.status(200).json(post.comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Error fetching comments", details: err });
  }
});

// Delete a comment from a post

router.delete("/:postId/comments/:commentId", auth, async (req, res) => {
  try {
    // Find the post by its ID
    const post = await Post.findById(req.params.postId);
    if (!post) {
      console.log("Post not found");
      return res.status(404).json({ error: "Post not found" });
    }

    // Find the comment by its ID within the post
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      console.log("Comment not found");
      return res.status(404).json({ error: "Comment not found" });
    }

    // Debugging: Log the comment's ID and the comment ID from the request
    console.log("Comment ID:", comment._id.toString());
    console.log("Request Comment ID:", req.params.commentId);
    console.log("comment userId", comment.userId);
    console.log("req userId:", req.user.userId);

    // Check if the logged-in user is the author of the comment
    if (comment.userId.toString() === req.user.userId.toString()) {
      // Use $pull to remove the specific comment by ID
      const result = await Post.updateOne(
        { _id: req.params.postId },
        {
          $pull: {
            comments: { _id: new mongoose.Types.ObjectId(req.params.commentId) },
          },
        }
      );

      // Debugging: Log the result of the update operation
      console.log("Update Result:", result);

      if (result.nModified === 0) {
        console.log("No comment was deleted");
        return res.status(404).json({ error: "Comment not deleted" });
      }

      res.status(200).json({ message: "Comment deleted successfully" });
    } else {
      console.log("User not authorized to delete this comment");
      res.status(403).json("You can delete only your comment");
    }
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Error deleting comment", details: err });
  }
});

export default router;


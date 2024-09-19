import express from "express";
import Notification from "../models/Notification.js"; // Assuming the path
import auth from "../utils/auth.js";

const router = express.Router();


// Fetch notifications for the current user
router.get("/notifications", auth, async (req, res) => {
  try {
    // Fetch notifications for the logged-in user
    let notifications = await Notification.find({ "user._id": req.user.userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log("Notifications fetched:", notifications);

    // Ensure `notifications` is an array
    if (!Array.isArray(notifications)) {
      notifications = [notifications];
    }

    if (notifications.length === 0) {
      console.warn("No notifications found for user:", req.user.userId);
    }

    // Wrap notifications in an object with a `notifications` key
    res.status(200).json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res
      .status(500)
      .json({ message: "Error fetching notifications", error: err.message });
  }
});

// Route to add follow notifications
router.post("/notifications/follow", auth, async (req, res) => {
  try {
    const { followUserId } = req.body;

    if (!followUserId) {
      return res.status(400).json({ message: "Follow user ID is required" });
    }

    // Create a new follow notification
    const newNotification = new Notification({
      user: { _id: req.user.userId }, // The user who is being followed
      fromUser: { _id: req.user.userId }, // The user who is following
      type: "follow",
      message: `${req.user.username} started following you.`,
      createdAt: new Date(),
    });

    await newNotification.save();

    // Optionally, you might want to fetch and send all notifications after saving
    const notifications = await Notification.find({
      "user._id": req.user.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(201).json({ notifications });
  } catch (err) {
    console.error("Error creating follow notification:", err);
    res
      .status(500)
      .json({
        message: "Error creating follow notification",
        error: err.message,
      });
  }
});





router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });

      // Create a new notification
      const newNotification = new Notification({
        type: "like",
        userId: post.userId, // the owner of the post
        senderId: req.body.userId, // the user who liked the post
        postId: post._id,
        read: false,
      });
      await newNotification.save();

      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error liking/disliking the post", details: err });
  }
});
export default router;


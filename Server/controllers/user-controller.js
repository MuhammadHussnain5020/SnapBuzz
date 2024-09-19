import User from "../models/user.js";
import multer from "multer";
import path from "path";
import Notification from "../models/Notification.js";
import Post from "../models/post.js"


// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!file) {
      // Handle the case where no file is provided
      cb(new Error("No file provided"), "uploads/");
    } else {
      cb(null, "uploads/");
    }
  },
  filename: (req, file, cb) => {
    if (!file) {
      // If no file, you might set a default filename or take other action
      cb(null, "../uploads/images.png");
    } else {
      cb(null, Date.now() + path.extname(file.originalname));
    }
  },
})

export const upload = multer({ storage });

// Serve static files

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "followers following posts"
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      ...user.toObject(),
      profilePhoto: user.profilePhoto
        ? `${req.protocol}://${req.get("host")}/${user.profilePhoto}`
        : null,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user profile" });
  }
};

export const updateProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.file) {
      // Save the file path with forward slashes
      user.profilePhoto = req.file.path.replace("\\", "/");
      await user.save();
      res.json({
        message: "Profile photo updated successfully",
        profilePhoto: user.profilePhoto,
      });
    } else {
      res.status(400).json({ message: "No file uploaded" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error updating profile photo" });
  }
};

export const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.userId;

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username;
    await user.save();

    res
      .status(200)
      .json({
        message: "Username updated successfully",
        username: user.username,
      });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ message: "Error updating username" });
  }
};


export const toggleFollowUser = async (req, res) => {
  try {
    const { id } = req.params; // User to be followed/unfollowed
    const currentUserId = req.user.userId;

    if (!id || !currentUserId) {
      return res
        .status(400)
        .json({ message: "User ID or current user ID is missing" });
    }

    if (id === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({ message: "Current user not found" });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const isFollowing = user.following.includes(id);

    if (isFollowing) {
      await user.updateOne({ $pull: { following: id } });
      await targetUser.updateOne({ $pull: { followers: currentUserId } });

      // Remove the follow notification if exists
      await Notification.findOneAndDelete({
        "user._id": id,
        "fromUser._id": currentUserId,
        type: "follow",
      });

      res.json({ message: "Unfollowed user successfully" });
    } else {
      await user.updateOne({ $addToSet: { following: id } });
      await targetUser.updateOne({ $addToSet: { followers: currentUserId } });

      // Create a follow notification
      const newNotification = new Notification({
        user: {
          _id: targetUser._id,
          username: targetUser.username,
          profilePhoto: targetUser.profilePhoto,
        },
        type: "follow",
        fromUser: {
          _id: user._id,
          username: user.username,
          profilePhoto: user.profilePhoto,
        },
      });

      await newNotification.save();

      res.json({
        message: "Followed user successfully and notification created",
      });
    }
  } catch (err) {
    console.error("Error in toggleFollowUser:", err);
    res.status(500).json({ message: "Error toggling follow status" });
  }
};

// Get Followed Users
export const getFollowedUsers = async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId).populate(
      "following",
      "username email profilePhoto"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ followedUsers: user.following });
  } catch (error) {
    console.error("Error fetching followed users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get Followers
export const getFollowers = async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId).populate(
      "followers",
      "username email profilePhoto"
    );

    if (!user) {
      console.error("User not found with ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ followers: user.followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowersAndFollowing = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    const user = await User.findById(userId).populate(
      "followers following",
      "username profilePhoto"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ followers: user.followers, following: user.following });
  } catch (err) {
    console.error("Error fetching followers and following:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowerById = async (req, res) => {
  try {
    const followerId = req.params.id;

    // Find the follower by ID
    const follower = await User.findById(followerId).select("-password"); // Exclude the password field

    if (!follower) {
      return res.status(404).json({ message: "Follower not found" });
    }

    // Optionally, you can include additional data like posts, followers, etc.
    const posts = await Post.find({ userId: followerId }); // Assuming you have a Post model

    return res.status(200).json({ follower, posts });
  } catch (error) {
    console.error("Error fetching follower data:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


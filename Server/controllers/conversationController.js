import User from "../models/user.js";
import Conversation from "../models/conversationModel.js";

export const getConversations = async (req, res) => {
  try {
    // Fetch the current user
    const user = await User.findById(req.user.id)
      .populate("followers", "username profilePhoto")
      .populate("following", "username profilePhoto");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Extract follower and following IDs
    const followerIds = user.followers.map((follower) => follower._id);
    const followingIds = user.following.map((following) => following._id);
    const allIds = [...new Set([...followerIds, ...followingIds])];

    // Check if the ids array is populated
    if (allIds.length === 0) {
      return res.status(200).json({ conversations: [] });
    }

    // Fetch conversations involving these users
    const conversations = await Conversation.find({
      participants: { $in: allIds },
    })
      .populate("participants", "username profilePhoto")
      .sort({ updatedAt: -1 });

    // Create a map of user details for quick lookup
    const userDetails = new Map(
      allIds.map((id) => [
        id.toString(),
        {
          _id: id,
          username:
            user.followers.find((f) => f._id.equals(id))?.username ||
            user.following.find((f) => f._id.equals(id))?.username,
          profilePhoto:
            user.followers.find((f) => f._id.equals(id))?.profilePhoto ||
            user.following.find((f) => f._id.equals(id))?.profilePhoto,
        },
      ])
    );

    // Update user details with last message from conversations
    conversations.forEach((conversation) => {
      conversation.participants.forEach((participant) => {
        const participantId = participant._id.toString();
        const userDetail = userDetails.get(participantId);
        if (userDetail) {
          userDetail.lastMessage = conversation.lastMessage || null;
        }
      });
    });

    // Convert userDetails map to an array
    const allUsers = Array.from(userDetails.values());

    return res.status(200).json({ conversations: allUsers });
  } catch (err) {
    console.error("Error in getConversations:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
// conversationController.js

export const createConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;

    // Check if a conversation already exists
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      // Create a new conversation if none exists
      conversation = new Conversation({
        members: [senderId, receiverId],
      });

      await conversation.save();
    }

    return res.status(200).json({ conversationId: conversation._id });
  } catch (err) {
    console.error("Error in createConversation:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


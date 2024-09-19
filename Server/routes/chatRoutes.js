import express from "express";
import Conversation from "../models/conversationModel.js";
import User from "../models/user.js";
import Message from "../models/messageModel.js";

const router = express.Router();

// Create a new conversation
router.post("/", async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res
      .status(400)
      .json({ message: "Sender and Receiver IDs are required" });
  }

  try {
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        members: [senderId, receiverId],
      });
      await conversation.save();
    }

    res.status(200).json({ conversationId: conversation._id }); // Ensure conversation ID is returned
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating conversation", error: err });
  }
});

// Get messages from a conversation
router.get("/:conversationId", async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json({ messages });
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err });
  }
});

// Send a new message in a conversation
router.post("/:conversationId", async (req, res) => {
  const { senderId, receiverId, text } = req.body;
  const conversationId = req.params.conversationId;

  try {
    // Fetch sender details
    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Fetch receiver details
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Create a new message with sender and receiver details
    const newMessage = new Message({
      conversationId,
      sender: senderId,
      senderUsername: sender.username,
      senderProfilePhoto: sender.profilePhoto,
      receiver: receiverId,
      receiverUsername: receiver.username,
      receiverProfilePhoto: receiver.profilePhoto,
      text,
    });

    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err });
  }
});

export default router;

import Message from "../models/messageModel.js";
import User from "../models/user.js";

const sendMessage = async (req, res) => {
  const { conversationId, senderId, receiverId, text } = req.body;

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

    // Create a new message
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
    res.status(500).json(err);
  }
};

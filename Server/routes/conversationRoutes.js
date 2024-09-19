// conversationRoutes.js
import express from "express";
import { createConversation, getConversations } from "../controllers/conversationController.js";
import auth from "../utils/auth.js";

const router = express.Router();

router.get("/", auth, getConversations);
router.post("/", auth, createConversation); // Added POST route for creating a conversation
export default router;

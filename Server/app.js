import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/user-routes.js";
import postRoutes from "./routes/post-routes.js";
import dotenv from "dotenv";
import authRoutes from "./routes/auth-routes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/chatRoutes.js";
import subscriptionRoutes from "./routes/subscription.js";
import Stripe from "stripe";
// import User from "./models/user.js";
import planRoutes from "./routes/planRoutes.js"
import { handleStripeWebhook } from "./controllers/webhookController.js";
import bodyParser from "body-parser";



// Resolve __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config(); // Load environment variables from .env file

const app = express();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);


app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve uploaded files
app.use(cors());
app.use(bodyParser.json());


// API routes
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", planRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleStripeWebhook
);
app.use((req, res, next) => {
  console.log(`Received ${req.method} request for ${req.url}`);
  next();
});






// MongoDB connection
await mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

import Stripe from "stripe";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error("Stripe secret key is not defined");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey);

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Amount is required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // amount in paise
      currency: "pkr",
      payment_method_types: ["card"],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: error.message });
  }
};

export const saveUserPlan = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan) {
      return res.status(400).json({ error: "Plan is required" });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.plan = plan;
    user.postCount = 0;
    await user.save();

    res.json({ message: "Plan saved successfully" });
  } catch (error) {
    console.error("Error saving plan:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ plan: user.plan });
  } catch (error) {
    console.error("Error fetching user plan:", error);
    res.status(500).json({ error: error.message });
  }
};

// Define post limits for different plans
const POST_LIMITS = {
  Free: 5, // Free plan users can post up to 5 posts
  "20-posts": 20, // 20-posts plan users can post up to 20 posts
  Unlimited: Infinity, // Unlimited plan users can post unlimited posts
};

export const checkPostLimit = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const postLimit = POST_LIMITS[user.plan] || 0;
    const canPost = user.postCount < postLimit;

    res.json({ canPost });
  } catch (error) {
    console.error("Error checking post limit:", error);
    res.status(500).json({ error: error.message });
  }
};



import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, required: true, default: "Not selected Yet!" },
    priceId: { type: String, required: true },
    status: { type: String, required: true },
    currentPeriodEnd: { type: Date, required: true },
    // postCount: { type: Number, default: 0 }, // New field to track the post count
    // postLimit: { type: Number }, // Post limit based on the plan
    subscriptionId: { type: String, required: true }, // Subscription ID from Stripe
    stripeCustomerId: { type: String }, // Added for Stripe integration
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);

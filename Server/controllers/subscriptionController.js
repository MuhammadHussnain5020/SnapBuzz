import stripePackage from "stripe";
import User from "../models/user.js";
import Subscription from "../models/Subscription.js";

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

export const createOrUpdateSubscription = async (req, res) => {
  const { priceId } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Retrieve the existing subscription for the user
    const existingSubscription = await Subscription.findOne({
      user: user._id,
      status: "active",
    });

    let stripeCustomerId = user.stripeCustomerId;
    if (existingSubscription) {
      // Use the stripeCustomerId from the existing subscription
      stripeCustomerId = existingSubscription.stripeCustomerId;

      // Update the existing subscription in Stripe
      const subscription = await stripe.subscriptions.update(
        existingSubscription.subscriptionId,
        {
          items: [{ price: priceId }],
          expand: ["latest_invoice.payment_intent"],
        }
      );

      // Update the subscription details in your database
      existingSubscription.priceId = priceId;
      existingSubscription.currentPeriodEnd = getSubscriptionPeriodEnd(priceId);
      await existingSubscription.save();

      return res.json({
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        subscriptionId: subscription.id,
      });
    }

    // If no existing subscription, create a new Stripe customer if not already present
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
      });

      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    // Create a new subscription in Stripe
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });
    const getSubscriptionPeriodEnd = (priceId) => {
      const currentDate = new Date();

      switch (priceId) {
        case "price_1PxpJ6Ejq94yXjk5SUq0fLS3": // Basic plan
          return new Date(currentDate.setDate(currentDate.getDate() + 7)); // 1 week
        case "price_1PxpLbEjq94yXjk59cvPdARL": // Standard plan
          return new Date(currentDate.setDate(currentDate.getDate() + 30)); // 30 days
        case "price_1PxpHyEjq94yXjk5sLvZEWbT": // Premium plan
          return new Date(
            currentDate.setFullYear(currentDate.getFullYear() + 1)
          ); // 1 year
        default:
          throw new Error("Unknown priceId");
      }
    };

    // Save the new subscription details to the database
    const newSubscription = new Subscription({
      user: user._id,
      plan: getPlanNameByPriceId(priceId), // Dynamically set plan name based on priceId
      priceId,
      status: subscription.status,
      currentPeriodEnd: getSubscriptionPeriodEnd(priceId),
      subscriptionId: subscription.id,
      stripeCustomerId,
    });

    await newSubscription.save();

    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("Error creating or updating subscription:", error);
    res.status(400).json({ error: { message: error.message } });
  }
};

// Helper function to set the currentPeriodEnd based on the plan


// Helper function to get the plan name by priceId
const getPlanNameByPriceId = (priceId) => {
  switch (priceId) {
    case "price_1PxpJ6Ejq94yXjk5SUq0fLS3":
      return "Basic";
    case "price_1PxpLbEjq94yXjk59cvPdARL":
      return "Standard";
    case "price_1PxpHyEjq94yXjk5sLvZEWbT":
      return "Premium";
    default:
      return "Unknown";
  }
};


export const getSubscriptionById = async (req, res) => {
  const { subscriptionId } = req.params;

  try {
    // Retrieve the subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Update the subscription status and current period end in the database
    const existingSubscription = await Subscription.findOneAndUpdate(
      { subscriptionId },
      {
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
      { new: true } // Return the updated document
    );

    if (!existingSubscription) {
      return res.status(404).json({ error: "Subscription record not found" });
    }

    // Respond with the updated subscription
    res.json(existingSubscription);
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    res.status(400).json({ error: { message: error.message } });
  }
};

export const saveSubscription = async (req, res) => {
  const { plan, priceId } = req.body;

  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate the subscription period end date based on the plan
    const currentDate = new Date();
    let periodEndDate;

    switch (priceId) {
      case "price_1PxpJ6Ejq94yXjk5SUq0fLS3": // Basic plan
        periodEndDate = new Date(
          currentDate.setDate(currentDate.getDate() + 7)
        ); // 1 week
        break;
      case "price_1PxpLbEjq94yXjk59cvPdARL": // Standard plan
        periodEndDate = new Date(
          currentDate.setDate(currentDate.getDate() + 30)
        ); // 30 days
        break;
      case "price_1PxpHyEjq94yXjk5sLvZEWbT": // Premium plan
        periodEndDate = new Date(
          currentDate.setFullYear(currentDate.getFullYear() + 1)
        ); // 1 year
        break;
      default:
        return res.status(400).json({ error: "Unknown priceId" });
    }

    // Update or create the subscription
    const subscription = await Subscription.findOneAndUpdate(
      { user: user._id },
      {
        plan,
        priceId,
        status: "active",
        currentPeriodEnd: periodEndDate,
      },
      { upsert: true, new: true }
    );

    res.json(subscription);
  } catch (error) {
    console.error("Error saving plan:", error);
    res.status(500).json({ error: "Server error" });
  }
};


export const getUserPlan = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user.userId });

    if (!subscription || subscription.status !== "active") {
      return res.status(200).json({ plan: "Not selected Yet!" });
    }

    res.json({ plan: subscription.plan });
  } catch (error) {
    console.error("Error fetching user plan:", error);
    res.status(500).json({ error: "Failed to fetch user plan" });
  }
};

export const updateSubscriptionStatus = async (req, res) => {
  try {
    const { subscriptionId } = req.body;

    if (!subscriptionId) {
      return res.status(400).json({ error: "Subscription ID is required" });
    }

    // Find the subscription in your database
    const subscription = await Subscription.findOne({ subscriptionId });

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    // Update the subscription status in Stripe
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    subscription.status = "inactive";
    await subscription.save();

    res
      .status(200)
      .json({ message: "Subscription status updated to inactive" });
  } catch (error) {
    console.error("Error updating subscription status:", error);
    res.status(500).json({ error: "Server error" });
  }
};

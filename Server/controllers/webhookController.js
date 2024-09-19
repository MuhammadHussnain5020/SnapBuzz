// controllers/webhookController.js
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handleStripeWebhook = (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = event.data.object.subscription;
    // Handle successful subscription payment
  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    // Handle subscription cancellation
  }

  res.json({ received: true });
};

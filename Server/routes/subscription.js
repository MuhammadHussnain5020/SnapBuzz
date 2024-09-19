// In routes/subscription.js
import { Router } from "express";
import {
  createOrUpdateSubscription,
  saveSubscription,
  getUserPlan,
  updateSubscriptionStatus,
  getSubscriptionById
} from "../controllers/subscriptionController.js";
import auth from "../utils/auth.js";

const router = Router();

router.post("/create-subscription", auth, createOrUpdateSubscription);
router.patch("/create-subscription", auth, createOrUpdateSubscription);
router.patch("/save-plan", auth, saveSubscription);
router.get("/get-user-plan", auth, getUserPlan);
router.patch("/update-status", auth, updateSubscriptionStatus);
router.get("/api/subscription/:subscriptionId", auth, getSubscriptionById);



export default router;

import express from "express";
import {
  createPaymentIntent,
  saveUserPlan,
  getUserPlan,
  checkPostLimit
} from "../controllers/paymentController.js";
import auth from "../utils/auth.js";

const router = express.Router();

router.post("/create-payment-intent", auth, createPaymentIntent);
router.patch("/save-plan", auth, saveUserPlan);
router.get("/get-user-plan", auth, getUserPlan);
router.get("/check-post-limit",auth,checkPostLimit);
// Check post limit
// router.get("/check-post-limit", authenticate, checkPostLimit);

export default router;

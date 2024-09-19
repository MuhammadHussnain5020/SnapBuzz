import express from 'express';
import { signup, login,  getUserData, forgetPassword, verifyEmail} from '../controllers/auth-controller.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Route for user signup
router.post('/signup', signup);

// Route for user login
router.post('/login', login);

router.post("/reset-password", forgetPassword);

router.get('/me', authMiddleware, getUserData);

router.post("/verify-email", verifyEmail);

export default router;

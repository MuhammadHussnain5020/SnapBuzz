import express from "express";
import {
  getUserProfile,
  updateProfilePhoto,
  toggleFollowUser,
  getFollowedUsers,
  getFollowers,
  getFollowersAndFollowing,
  updateUsername,
  getFollowerById
} from "../controllers/user-controller.js";

import auth from "../utils/auth.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/me", auth, getUserProfile);
router.patch("/me", auth, upload.single("profilePhoto"), updateProfilePhoto);
router.post("/follow/:id", auth, toggleFollowUser);
router.get("/followedUsers", auth, getFollowedUsers);
router.get("/followers", auth, getFollowers);
router.get("/followers-following", auth, getFollowersAndFollowing);
router.patch("/me/username", auth, updateUsername);
router.get('/follower/:id', auth, getFollowerById);


export default router;

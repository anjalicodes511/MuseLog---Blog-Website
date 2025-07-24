const express = require("express");
const User = require("../models/User");
const {
  getUserProfile,
  getEditProfileForm,
  updateUserProfile,
  deleteUserAccount,
} = require("../controllers/userController");
const { ensureAuthenticated } = require("../middlewares/auth");
const upload = require("../config/multer");

const userRoutes = express.Router();

// Render profile page
userRoutes.get("/profile", ensureAuthenticated, getUserProfile);

// Render edit profile page
userRoutes.get("/edit", ensureAuthenticated, getEditProfileForm);
userRoutes.post(
  "/edit",
  ensureAuthenticated,
  upload.single("profilePicture"),
  updateUserProfile
);

// Delete user
userRoutes.post("/delete", ensureAuthenticated, deleteUserAccount);

module.exports = userRoutes;

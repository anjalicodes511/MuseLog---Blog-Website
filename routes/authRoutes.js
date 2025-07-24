const express = require("express");
const User = require("../models/User");
const { logout } = require("../controllers/authController");
const {
  getLogin,
  login,
  getRegister,
  register,
} = require("../controllers/authController");

const authRoutes = express.Router();

// Render login page
authRoutes.get("/login", getLogin);

// Main logic for login
authRoutes.post("/login", login);

// Render register page
authRoutes.get("/register", getRegister);

// Main logic for user registration
authRoutes.post("/register", register);

// Logout
authRoutes.get("/logout", logout);

module.exports = authRoutes;

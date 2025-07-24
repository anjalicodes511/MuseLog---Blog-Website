const asyncHandler = require("express-async-handler");
const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/User");

// Get login page
exports.getLogin = asyncHandler((req, res) => {
  res.render("login.ejs", {
    title: "Login",
    error: "",
    user: req.user,
    cssFile: "login"
  });
});

// Login logic
exports.login = asyncHandler(async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("login", {
        title: "Login",
        user: req.user,
        error: info.message,
        cssFile: "login"
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect("/user/profile");
    });
  })(req, res, next);
});

// Get register page
exports.getRegister = asyncHandler((req, res) => {
  res.render("register.ejs", {
    title: "Register",
    user: req.user,
    error: "",
    cssFile: "register"
  });
});

// Register logic
exports.register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.render("register", {
        title: "Register",
        user: req.user,
        error: "User already exists",
        cssFile: "register"
      });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.redirect("/auth/login");
  } catch (error) {
    res.render("register", {
      title: "Register",
      user: req.user,
      error: error.message,
      cssFile: "register"
    });
  }
});

// Logout
exports.logout = asyncHandler((req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect("/auth/login");
  });
});

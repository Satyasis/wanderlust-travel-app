const express = require("express");
const wrapAsync = require("../utils/wrapAsync");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

// // renders sign up form
// router.get("/signup", userController.renderSignupForm);

// // saves the data of user from sign up form
// router.post("/signup", wrapAsync(userController.signup));

//combine for same route
router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.signup));

// // renders login page
// router.get("/login", userController.renderLoginForm);

// // authenticate if the user is registered or not. If registered then redirects to home page of the website
// // actual login done by passport
// router.post(
//   "/login",
//   saveRedirectUrl,
//   passport.authenticate("local", {
//     failureRedirect: "/login",
//     failureFlash: true,
//   }),
//   userController.login
// );

//combine for same route
router
  .route("/login")
  .get(userController.renderLoginForm)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

// logged out route -> passport method (req.logout())
router.get("/logout", userController.logout);

module.exports = router;

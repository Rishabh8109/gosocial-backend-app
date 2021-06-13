const express = require("express");
const {
  register,
  profilePictureUpload,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth");
const {
  getUserProfile,
  follow,
  unfollow,
  getUsers,
  update_user_profile
} = require("../controllers/profile");
const { isAuthenticated } = require("../middlewares/isAuthorized");
const router = express.Router();

// api routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/:userid/upload").post(profilePictureUpload);
router.route("/users").get(getUsers);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/:userid/follow").post(isAuthenticated, follow);
router.route("/:userid/unfollow").post(isAuthenticated, unfollow);
router.route("/update_user_profile").post(isAuthenticated, update_user_profile);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:resetToken").post(resetPassword);

module.exports = router;

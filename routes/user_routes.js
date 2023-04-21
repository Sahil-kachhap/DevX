const express = require("express");
const {register, login, logOut, profile, changePassword, updateProfile, forgotPassword, resetPassword, addToPlaylist, removeFromPlaylist} = require("../controllers/user_controller.js");
const { isAuthenticated } = require("../middlewares/auth.js");
const router = express.Router();

router.route("/register").post(register); 

// login route
router.route("/login").post(login);

// profile route
router.route("/profile").get(isAuthenticated, profile);

// logout route
router.route("/logout").get(logOut)

// change password
router.route("/password/change").put(isAuthenticated, changePassword);

// update profile data
router.route("/profile/update").put(isAuthenticated, updateProfile);

// forgot password route
router.route("/password/forgot").post(forgotPassword);

// reset password route
router.route("/password/reset/:token").put(resetPassword);

// add to playlist
router.route("/playlist/addVideo").post(isAuthenticated, addToPlaylist);

// remove from playlist
router.route("/playlist/removeVideo").delete(isAuthenticated, removeFromPlaylist);

module.exports = router;
const express = require("express");
const {register, login, logOut, profile} = require("../controllers/user_controller.js");
const { isAuthenticated } = require("../middlewares/auth.js");
const router = express.Router();

router.route("/register").post(register); 

// login route
router.route("/login").post(login);

// profile route
router.route("/profile").get(isAuthenticated, profile);

// logout route
router.route("/logout").get(logOut)

module.exports = router;
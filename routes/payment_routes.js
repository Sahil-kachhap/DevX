const express = require("express");
const {isAuthenticated, authorizeAdmin} = require("../middlewares/auth.js");
const { buySubscription, verifyPayment, getRazorpayKey, cancelSubscription } = require("../controllers/payment_controller.js");

const router = express.Router();

router.route("/subscribe").get(isAuthenticated, buySubscription);

// Payment verification and add reference in database endpoint 
router.route("/payment/verify").post(isAuthenticated, verifyPayment);

// get razorpay key endpoint
router.route("/key").get(getRazorpayKey);

// cancel subscription
router.route("/subscribe/cancel").get(isAuthenticated, authorizeAdmin, cancelSubscription);

module.exports = router;
const express = require("express");
const {isAuthenticated} = require("../middlewares/auth.js");
const { buySubscription } = require("../controllers/payment_controller.js");

const router = express.Router();

router.route("/subscribe").get(isAuthenticated, buySubscription);

module.exports = router;
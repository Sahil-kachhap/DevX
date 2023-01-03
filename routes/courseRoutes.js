const express = require("express");
const getAllCourses = require("../controllers/courseController.js");
const router = express.Router();

router.route("/courses").get(getAllCourses);

module.exports = router;
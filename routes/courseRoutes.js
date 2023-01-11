const express = require("express");
const {getAllCourses, createCourse} = require("../controllers/courseController.js");
const router = express.Router();

router.route("/courses").get(getAllCourses);
router.route("/course").post(createCourse);

module.exports = router;
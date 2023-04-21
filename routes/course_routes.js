const express = require("express");
const {getAllCourses, createCourse, getCourseLectures, addCourseLecture} = require("../controllers/courseController.js");
const singleUpload = require("../middlewares/multer.js");
const router = express.Router();

router.route("/courses").get(getAllCourses);
router.route("/course").post(singleUpload, createCourse);
router.route("/course/:id").get(getCourseLectures).post(singleUpload, addCourseLecture);

module.exports = router;
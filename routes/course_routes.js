const express = require("express");
const {getAllCourses, createCourse, getCourseLectures, addCourseLecture, deleteCourse, deleteLecture} = require("../controllers/courseController.js");
const singleUpload = require("../middlewares/multer.js");
const { authorizeAdmin, isAuthenticated } = require("../middlewares/auth.js");
const router = express.Router();

router.route("/courses").get(getAllCourses);
router.route("/course").post(isAuthenticated, authorizeAdmin, singleUpload, createCourse);
router.route("/course/:id").get(isAuthenticated, getCourseLectures).post(isAuthenticated, authorizeAdmin, singleUpload, addCourseLecture).delete(isAuthenticated, authorizeAdmin, deleteCourse);
router.route("/lecture").delete(isAuthenticated, authorizeAdmin, deleteLecture);

module.exports = router;
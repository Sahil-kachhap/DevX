const {Course} = require("../models/Course.js");
const {catchAsyncError} = require("../middlewares/catchAsyncError.js");

const getAllCourses = catchAsyncError(async (req, res, next) => {
    const courses = await Course.find();
    res.status(200).json({
        'success': true,
        courses,
    });
});

module.exports = getAllCourses;
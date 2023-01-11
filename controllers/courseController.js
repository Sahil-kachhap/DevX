const {Course} = require("../models/Course.js");
const {catchAsyncError} = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/error_handler.js");



const getAllCourses = catchAsyncError(async (req, res, next) => {
    // get all courses from DB excluding the lectures of the course 
    const courses = await Course.find().select("-lectures");
    res.status(200).json({
        "success": true,
        courses,
    });
});

const createCourse = catchAsyncError(async (req, res, next) => {
    console.log(req.body);
   const {title, description, category, createdBy} = req.body;

   if(!title || !description || !category || !createdBy){
      return next(new ErrorHandler("Please add all fields", 400));
   }

   //const file = req.file; // returns blob 

   await Course.create({
    title, 
    description,
    category,
    createdBy,
    poster: {
        public_id: "temp_id",
        url: "temp_url",
     }, 
   });
   
   res.status(201).json({
    "success": true,
    "message": "Course created successfully", 
   });
});

module.exports = {getAllCourses, createCourse};
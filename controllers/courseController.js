const {Course} = require("../models/Course.js");
const {catchAsyncError} = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/error_handler.js");
const cloudinary = require("cloudinary");



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

   const file = req.file;
   const fileUri = getDataUri(file).content;
   const myCloud = await cloudinary.v2.uploader.upload(fileUri);

   await Course.create({
    title, 
    description,
    category,
    createdBy,
    poster: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
     }, 
   });
   
   res.status(201).json({
    "success": true,
    "message": "Course created successfully", 
   });
});

const getCourseLectures = catchAsyncError(async (req, res, next) => {
    // get all courses from DB excluding the lectures of the course 
    const course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorHandler("Course not found", 404));
    }

    course.views += 1;

    await course.save();

    res.status(200).json({
        "success": true,
        "lectures": course.lectures,
    });
});

const addCourseLecture = catchAsyncError(async (req, res, next) => {
    const {id} = req.params;
    const {title, description} = req.body;  
    // get all courses from DB excluding the lectures of the course 
    const course = await Course.findById(req.params.id);

    if(!course){
        return next(new ErrorHandler("Course not found", 404));
    }

    course.lectures.push({
        title, 
        description, 
        video:{
            public_id: "temp_id",
            url: "temp_url",
        }
    });

    course.numOfVideos = course.lectures.length;

    await course.save();

    res.status(200).json({
        "success": true,
        "message": "Lecture added in course successfully",
    });
});

module.exports = {getAllCourses, createCourse, getCourseLectures, addCourseLecture};
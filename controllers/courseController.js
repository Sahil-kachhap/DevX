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

   const file = req.file;
   const fileUri = getDataUri(file).content;
   const myCloud = await cloudinary.v2.uploader.upload(fileUri, {
         resource_type: "video",
   });

    course.lectures.push({
        title, 
        description, 
        video:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        }
    });

    course.numOfVideos = course.lectures.length;

    await course.save();

    res.status(200).json({
        "success": true,
        "message": "Lecture added in course successfully",
    });
});

const deleteCourse = catchAsyncError(async (req, res, next) => {
    const {id} = req.params;

    const course = await Course.findById(id);

    if(!course){
        return next(new ErrorHandler("Course not found", 404));
    }

    await cloudinary.v2.uploader.destroy(course.poster.public_id);

    for(let currentLecture = 0; currentLecture < course.lectures.length; currentLecture++){
        const lecture = course.lectures[currentLecture];
        await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
            resource_type: "video",
        });
    }

    await course.remove();

    res.status(200).json({
        "success": true,
        "message": "Course deleted successfully",
    });
});

const deleteLecture = catchAsyncError(async (req, res, next) => {
    const {courseId, lectureId} = req.query;

    const course = await Course.findById(courseId);

    if(!course){
        return next(new ErrorHandler("Course not found", 404));
    }

    const lecture = course.lectures.find(lecture => {
        if(lecture._id.toString() === lectureId.toString()) return lecture;
    });

    await cloudinary.v2.uploader.destroy(lecture.video.public_id, {
        resource_type: "video",
    });

    course.lectures = course.lectures.filter(lecture => {
        if(lecture._id.toString() !== lectureId.toString()) return lecture;
    });

    course.numOfVideos = course.lectures.length;

    await course.save();

    res.status(200).json({
        "success": true,
        "message": "Lecture deleted successfully",
    });
});

module.exports = {getAllCourses, createCourse, deleteCourse, getCourseLectures, addCourseLecture, deleteLecture};
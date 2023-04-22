const { Error } = require("mongoose");
const {catchAsyncError} = require("../middlewares/catchAsyncError.js");
const {User} = require("../models/User.js");
const {Course} = require("../models/Course.js");
const ErrorHandler = require("../utils/error_handler.js");
const { sendEmail } = require("../utils/send_email.js");
const {sendToken} = require("../utils/send_token.js");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const getDataUri = require("../utils/dataUri.js");

const register = catchAsyncError(async (req, res, next) => {
   console.log(req.body);
   const {name, email, password} = req.body;
   const file = req.file;

   if(!name || !email || !password || !file){
     return next(new ErrorHandler("Please enter all the fields", 400));
   }

   let user = await User.findOne({email});
   if(user)
      return next(new ErrorHandler("User already exists", 409));

      const fileUri = getDataUri(file).content;
      const myCloud = await cloudinary.v2.uploader.upload(fileUri);

   user = await User.create({
     name,
     email,
     password,
     avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
     },
   });

   sendToken(res, user, "Registered Successfully", 201);
});

const login = catchAsyncError(async (req, res, next) => {
   const {email, password} = req.body;

   if(!email || !password){
      return next(new ErrorHandler("All fields are required", 400));
   }

   const user = await User.findOne({email}).select("+password");

   if(!user) 
     return next(new ErrorHandler("Incorrect user credentials", 401));

   const isMatch = await user.comparePassword(password);

   if(!isMatch) 
      return next(new ErrorHandler("Incorrect user credentials", 401));
   
   sendToken(res, user, `Welcome back, ${user.name}`, 200);
});

const logOut = catchAsyncError(async (req, res, next) => {
   res.status(200).cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      secure: true,
      sameSite: "none",
   }).json({
      "success": true,
      "message": "logged out successfully",
   })
});

const profile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    user,
  });
});

const updateProfile = catchAsyncError(async (req, res, next) => {
   const {name, email} = req.body;

   const user = await User.findById(req.user._id);

   if(name) 
       user.name = name;

   if(email)
       user.email = email;

   await user.save();
   
   res.status(200).json({
      success: true,
      message: "Profile updated successfully",
   });
});

const updateProfilePicture = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);
   const file = req.file;
   const fileUri = getDataUri(file).content;
   const myCloud = await cloudinary.v2.uploader.upload(fileUri);

   await cloudinary.v2.uploader.destroy(user.avatar.public_id);

   user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
   };

   await user.save();

   res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
   });
});

const changePassword = catchAsyncError(async (req, res, next) => {
  const {oldPassword, newPassword} = req.body;

  if(!oldPassword || !newPassword){
    return next(new ErrorHandler("All Fields are required", 400));
  }

  const user = await User.findById(req.user._id).select("+password");
  
  const passwordMatched = await user.comparePassword(oldPassword);

  if(!passwordMatched)
    return next(new ErrorHandler("Incorrect old password", 400));

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "password changed successfully",
  });
});

const forgotPassword = catchAsyncError(async (req, res, next) => {
   const {email} = req.body;
   
   const user = await User.findOne({email});

   if(!user) 
      return next(new ErrorHandler("User not found", 400));

   const resetToken = await user.getResetToken();

   await user.save();

   const url = `${process.env.FRONTEND_URL}/resetPassword/${resetToken}`;
   const message = `Click on the link to reset your password. ${url}. If you have not requested then please ignore`;

   await sendEmail(user.email, "DevX Reset Password", message);

   res.status(200).json({
      success: true,
      message: `Password reset mail has been sent on ${user.email}`
   });
});

const resetPassword = catchAsyncError(async (req, res, next) => {
  
   const {token} = req.params;
   const ResetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");

   const user = await User.findOne({
      ResetPasswordToken,
      ResetPasswordExpire:{
      $gt: Date.now(),
     }
   });
   
   if(!user){
      return next(new ErrorHandler("Token is invalid or has been expired", 401));
   }

   user.password = req.body.password;
   user.ResetPasswordExpire = undefined;

   await user.save();

   res.status(200).json({
      success: true,
      message: "Password reset successfully",
   });
});

const addToPlaylist = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);
   const course = await Course.findById(req.body.id);

   if(!course){
      return next(new ErrorHandler("Course not found", 404));
   }

   const courseExists = user.playlist.find((item) => {
      if(item.course.toString() === course._id.toString())
         return true;
   });

   if(courseExists){
      return next(new ErrorHandler("Course already exists in playlist", 409));
   }

   user.playlist.push({
      course:course._id,
      poster:course.poster.url,
   });

   await user.save();

   res.status(200).json({
      success: true,
      message: "Course added to playlist",
   });
});


const removeFromPlaylist = catchAsyncError(async (req, res, next) => {
   const user = await User.findById(req.user._id);
   const course = await Course.findById(req.query.id);

   if(!course){
      return next(new ErrorHandler("Course not found", 404));
   }

   const newPlaylist = user.playlist.filter(item => {
      if(item.course.toString() !== course._id.toString()) return item;
   });

   user.playlist = newPlaylist;
   await user.save();

   res.status(200).json({
      success: true,
      message: "Removed from playlist",
   });
});

module.exports = {register, login, logOut, profile, changePassword, updateProfile, updateProfilePicture, forgotPassword, resetPassword, addToPlaylist, removeFromPlaylist};
const {catchAsyncError} = require("../middlewares/catchAsyncError.js");
const {User} = require("../models/User.js");
const {sendToken} = require("../utils/send_token.js");

const register = catchAsyncError(async (req, res, next) => {
   console.log(req.body);
   const {name, email, password} = req.body;

   //const file = req.file;
   if(!name || !email || !password){
     return next(new ErrorHandler("Please enter all the fields", 400));
   }

   let user = await User.findOne({email});
   if(user)
      return next(new ErrorHandler("User already exists", 409));

   user = await User.create({
     name,
     email,
     password,
     avatar: {
        public_id: "temp_id",
        url: "temp_url",
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
  console.log(user);

  res.status(200).json({
    success: true,
    user,
  });
});

module.exports = {register, login, logOut, profile};
const jwt = require("jsonwebtoken");
const { User } = require("../models/User.js");
const { catchAsyncError } = require("./catchAsyncError.js");
const ErrorHandler = require("../utils/error_handler.js");


const isAuthenticated = catchAsyncError(async (req, res, next) => {
    const {token} = req.cookies;
    console.log(token);

    if(!token)
      return next(new ErrorHandler("Not Logged In", 401));

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedToken._id);
    next();
});

const authorizeAdmin = (req, res, next) => {
  if(req.user.role !== "admin"){
    return next(new ErrorHandler(`${req.user.role} is not allowed to access this resource`, 403));
  }

  next();
}


module.exports = {isAuthenticated, authorizeAdmin};
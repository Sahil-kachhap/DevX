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


module.exports = {isAuthenticated};
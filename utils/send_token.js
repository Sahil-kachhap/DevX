const sendToken = (res, user, message, statusCode = 200) => {
   console.log(Date.now() + 15 * 60 * 60 * 1000);
   
   const token = user.getToken();
   const options = {
     expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
     httpOnly: true,
     secure: false,
     sameSite: "none",
   };
   
   res.status(statusCode).cookie("token", token, options).json({
     success: true,
     message, 
     user,
   });
}

module.exports = {sendToken};
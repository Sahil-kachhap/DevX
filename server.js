const app = require("./app.js");
const {connectDB} = require("./config/database.js");
const cloudinary = require("cloudinary");
const razorpay = require("razorpay");

connectDB();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const instance = new razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on Port: ${process.env.PORT}`);
})

module.exports = instance;
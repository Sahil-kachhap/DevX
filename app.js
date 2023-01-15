const express = require("express");
const {config} = require("dotenv");
const course = require("./routes/course_routes.js");
const user = require("./routes/user_routes.js");
const ErrorMiddleWare = require("./middlewares/error.js");
const cookieParser = require("cookie-parser");

config({
    path: "./config/config.env",
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use("/api/v1", course);
app.use("/api/v1", user);

module.exports = app;

app.use(ErrorMiddleWare);
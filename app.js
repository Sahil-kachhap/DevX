const express = require("express");
const {config} = require("dotenv");
const course = require("./routes/courseRoutes.js");

config({
    path: "./config/config.env",
});

const app = express();
app.use("/api/v1", course);

module.exports = app;
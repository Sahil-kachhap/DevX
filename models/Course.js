const mongoose = require("mongoose");
const schema = new mongoose.Schema({
   title:{
    type:String,
    required:[true,"course title is required"],
    minLength:[4,"title must be atleast 4 characters"],
    maxLength:[80, "title can have maximum 80 characters"]
   },
   description:{
    type:String,
    required:[true,"course description is required"],
    minLength:[20,"title must be atleast 20 characters"],
   },
   lectures:[
    {
        title:{
            type:String,
            required:true,
        },
        description:{
            type:String,
            required:true,
        },
        video:{
            public_id:{
                type:String,
                required:true,
            },
            url:{
                type:String,
                required:true,
            },
        },
    }
   ],
   poster:{
    public_id:{
        type:String,
        required:true,
    },
    url:{
        type:String,
        required:true,
    },
   },
   views:{
     type: Number,
     default:0,
   },
   numOfVideos:{
    type:Number,
    default:0,
   },
   category:{
    type:String,
    required:true,
   },
   createdBy:{
    type:String,
    required:[true, "Course creator name is required"],
   },
   createdAt:{
    type:Date,
    default:Date.now,
   }
});

const Course = mongoose.model("Course", schema);
module.exports = Course;
const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const schema = new mongoose.Schema({
    name: {
        type: String,
        required:[true, "Please enter your name"],
    },
    email: {
        type: String,
        required:[true, "Please enter your email"],
        unique:true,
        validate:validator.isEmail,
    },
    password: {
        type: String,
        required:[true, "Please enter your password"],
        minLength:[6,"Password must be at least 6 characters"],
        select:false,
    },
    role: {
        type: String,
        enum:["admin","user"],
        default:"user",
    },
    subscription:{
        id:String,
        status:String,
    },
    avatar:{
        public_id:{
            type:String,
            required:true,
        },
        url:{
            type:String,
            required:true,
        },
    },
    playlist:[
        {
            course:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"Course",
            },
            poster:String,
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now,
    },
    ResetPasswordToken:String,
    ResetPasswordExpire:String,
});

schema.pre("save", async function(next){
   if(!this.isModified("password")) return next();
   this.password = await bcrypt.hash(this.password, 10);
   next();
})

schema.methods.getToken = function(){
    return jwt.sign({_id: this.id}, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });
}

schema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

schema.methods.getResetToken = function(){
   const resetToken = crypto.randomBytes(20).toString("hex");
   this.ResetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
   this.ResetPasswordExpire = Date.now() + 15 * 60 * 1000;
   return resetToken;
}

const User = mongoose.model("User", schema);
module.exports = {User};
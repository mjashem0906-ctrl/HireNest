const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
<<<<<<< HEAD
    username: {
        type: String,
        required: true,
        // unique:true
    },
    password: {
        type: String,
        required: false // Optional for Google Auth users
    },
    role: {
        type: String,
        enum: ["Admin", "Member", "IT_Member", "Mentor", "Job", "Candidate"],
        required: true
    },

    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: false // Initially false if they haven't set up profile
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    profileCompleted: {
        type: Number,
        default: 0
    }
}, { timestamps: true })
module.exports = mongoose.model("User", userSchema);
=======
    username:{
        type:String,
        required:true,
        // unique:true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:["Admin","Member", "IT_Member"],
        required:true
    },
    memberId:{
       type:mongoose.Schema.Types.ObjectId,
        ref:"Member",
        required:true
    }
},{timestamps:true})
module.exports = mongoose.model("User", userSchema);
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8

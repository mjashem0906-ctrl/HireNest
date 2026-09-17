const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
        enum: ["Admin", "Member", "IT_Member", "Mentor", "Job", "Candidate", "Recruiter"],
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

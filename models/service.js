const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    companyName: {
        type: String,
        default: "" 
    },
    employmentType: {
        type: String,
        default: "Full-time" 
    },
    location: {
        type: String,
        default: "" 
    },
    education: {
        type: String,
        default: ""
    },
    passedOutYear: {
        type: String,
        default: ""
    },
    experience: {
        type: String,
        default: ""
    },
    salary: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        default: ""
    },
    keySkills: {
        type: String,
        default: ""
    },
    
    // 👇 NEW FIELD ADDED HERE
    refereedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member", // Links to your Member collection
        default: null
    },
    // -------------------------

    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    appliedMembers: [{
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member"
        },
        status: {
            type: String,
            enum: ["Applied", "Shortlisted", "Accepted", "Rejected"],
            default: "Applied"
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Service", serviceSchema);
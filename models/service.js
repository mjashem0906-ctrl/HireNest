const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    // customId:{
    //     type:String,
    //     required:true,
    // },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    // --- NEW FIELDS START ---
    companyName: {
        type: String,
        default: "" // Default to empty string if not provided
    },
    employmentType: {
        type: String,
        default: "Full-time" // Default value
    },
    location: {
        type: String,
        default: "" 
    },
    // --- NEW FIELDS END ---
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
    // type:{
    //     type:String,
    //     required:true,
    // },

},
    { timestamps: true }
)

module.exports = mongoose.model("Service", serviceSchema);
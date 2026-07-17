const mongoose = require("mongoose");

const mentorConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ✅ actual member profile id for navigation to member details page
    userMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    userDetails: {
      name: String,
      email: String,
      phone: String,
      role: String,
      memberType: String,
      photoUrl: String,
    },

    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    mentorDetails: {
      name: String,
      email: String,
      designation: String,
      experience: String,
      photoUrl: String,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "meeting_schedule"],
      default: "pending",
    },

    message: String,

    domain: String,
    skill: String,

    meetingDate: String,
    meetingTime: String,
    meetingMessage: String,
    meetingLink: String,

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorConnection", mentorConnectionSchema);
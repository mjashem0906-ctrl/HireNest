const mongoose = require("mongoose");

const googleUserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Member", "IT_Member", "Mentor", "Job", "Candidate"],
      required: true,
      default: "Candidate",
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: false,
    },
    profileCompleted: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, collection: "googleusers" }
);

module.exports = mongoose.model("GoogleUser", googleUserSchema);

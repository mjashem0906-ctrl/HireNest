const mongoose = require("mongoose");

const jobEmailNotificationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    jobSeekerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    recipientName: {
      type: String,
      default: "",
      trim: true,
    },
    matchingDetails: {
      matchedRole: { type: String, default: "" },
      seekerPreferredRoles: [{ type: String }],
      jobRole: { type: String, default: "" },
      matchedSkills: [{ type: String }],
      seekerSkills: [{ type: String }],
      jobSkills: [{ type: String }],
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "skipped"],
      default: "pending",
    },
    messageId: {
      type: String,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index to guarantee duplicate notification prevention at database level
jobEmailNotificationSchema.index({ jobId: 1, recipientEmail: 1 }, { unique: true });
jobEmailNotificationSchema.index({ jobId: 1, jobSeekerId: 1 });

module.exports = mongoose.model("JobEmailNotification", jobEmailNotificationSchema);

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  recipientRole: {
    type: String,
    enum: ["Admin", "Member", "IT_Member", "Mentor", "Job", "Candidate"],
    default: null
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      "submission_confirmation",
      "status_update",
      "new_job_post",
      "interview_notification",
      "new_application",
      "pending_action",
      "system_notification",
      "mentor_acceptance",
      "meeting_schedule"
    ],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedModel: {
    type: String,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  dismissedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

// Create indexes for faster queries
notificationSchema.index({ recipient: 1 });
notificationSchema.index({ recipientRole: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);

const mongoose = require("mongoose");

const notificationWorkflowSchema = new mongoose.Schema({
  notificationType: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  inAppEnabled: {
    type: Boolean,
    default: true
  },
  emailEnabled: {
    type: Boolean,
    default: true
  },
  recipientRole: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("NotificationWorkflow", notificationWorkflowSchema);

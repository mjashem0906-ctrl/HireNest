const NotificationWorkflow = require("../models/NotificationWorkflow");

const defaultWorkflows = [
  {
    notificationType: "submission_confirmation",
    displayName: "Submission Confirmation",
    description: "Sent to candidates when they successfully submit a job application.",
    inAppEnabled: true,
    emailEnabled: true,
    recipientRole: "Candidate"
  },
  {
    notificationType: "status_update",
    displayName: "Application Status Update",
    description: "Sent to candidates when their job application status changes (e.g. Review, Offer, Rejected).",
    inAppEnabled: true,
    emailEnabled: true,
    recipientRole: "Candidate"
  },
  {
    notificationType: "new_job_post",
    displayName: "New Job Post Alert",
    description: "Sent to candidates/members when a new job opportunity is posted.",
    inAppEnabled: true,
    emailEnabled: true,
    recipientRole: "Candidate"
  },
  {
    notificationType: "interview_notification",
    displayName: "Interview Notification",
    description: "Sent to candidates when their application is moved to the Interview stage.",
    inAppEnabled: true,
    emailEnabled: true,
    recipientRole: "Candidate"
  },
  {
    notificationType: "new_application",
    displayName: "New Application Alert",
    description: "Sent to Admins when a candidate applies for a job.",
    inAppEnabled: true,
    emailEnabled: true,
    recipientRole: "Admin"
  },
  {
    notificationType: "pending_action",
    displayName: "Pending Action Alert",
    description: "Sent to Admins when a status change request or pending action requires review.",
    inAppEnabled: true,
    emailEnabled: true,
    recipientRole: "Admin"
  },
  {
    notificationType: "system_notification",
    displayName: "System-level Notifications",
    description: "Sent to Admins for system notifications and approval alerts.",
    inAppEnabled: true,
    emailEnabled: true,
    recipientRole: "Admin"
  },
  {
    notificationType: "mentor_acceptance",
    displayName: "Mentor Acceptance Alert",
    description: "Sent to candidates when a mentor accepts their connection request.",
    inAppEnabled: true,
    emailEnabled: true,
    recipientRole: "Candidate"
  },
  {
    notificationType: "meeting_schedule",
    displayName: "Meeting Scheduled Alert",
    description: "Sent to candidates when a meeting is scheduled with their mentor.",
    inAppEnabled: true,
    emailEnabled: true,
    recipientRole: "Candidate"
  }
];

const seedNotificationWorkflows = async () => {
  try {
    for (const workflow of defaultWorkflows) {
      await NotificationWorkflow.findOneAndUpdate(
        { notificationType: workflow.notificationType },
        { $setOnInsert: workflow },
        { upsert: true, new: true }
      );
    }
    console.log("✅ Default notification workflows initialized/checked.");
  } catch (error) {
    console.error("❌ Failed to seed default notification workflows:", error);
  }
};

module.exports = seedNotificationWorkflows;

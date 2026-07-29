const Notification = require("../models/Notification");
const NotificationWorkflow = require("../models/NotificationWorkflow");
const User = require("../models/login");
const GoogleUser = require("../models/googleUser");
const { sendStatusUpdateNotification, sendAdminApplicationNotification, sendEmail } = require("./emailService");

/**
 * Trigger a notification (In-app, Email, or both) based on workflow configuration.
 * 
 * @param {Object} options
 * @param {String} options.type - One of the workflow event types (e.g. 'submission_confirmation')
 * @param {String} [options.recipientId] - ID of the target User (for individual candidate notifications)
 * @param {String} options.title - Notification Title
 * @param {String} options.message - Notification Message/Body
 * @param {String} [options.relatedId] - Associated entity ID (e.g. Job ID)
 * @param {String} [options.relatedModel] - Model name of associated entity (e.g. 'Service')
 * @param {Object} [options.data] - Additional details (like jobTitle, candidateName, newStatus) for email templates
 */
const triggerNotification = async ({
  type,
  recipientId = null,
  title,
  message,
  relatedId = null,
  relatedModel = null,
  data = {}
}) => {
  try {
    // 1. Fetch the workflow configuration for this notification type
    let workflow = await NotificationWorkflow.findOne({ notificationType: type });
    if (!workflow) {
      console.warn(`[Notification] Workflow configuration not found for type: ${type}. Defaulting to enabled.`);
      workflow = { inAppEnabled: true, emailEnabled: true, recipientRole: "Candidate" };
    }

    // 2. Fetch recipient user details if recipientId is provided
    let recipientUser = null;
    let recipientEmail = null;
    let recipientName = null;

    if (recipientId) {
      recipientUser = (await User.findById(recipientId).populate("memberId")) || (await GoogleUser.findById(recipientId).populate("memberId"));
      if (recipientUser) {
        recipientEmail = recipientUser.username; // Username is the login email
        recipientName = recipientUser.memberId?.name || recipientUser.username.split("@")[0];
      }
    }

    // 3. Create In-App Notification if enabled in workflow
    if (workflow.inAppEnabled) {
      await Notification.create({
        recipient: recipientId,
        recipientRole: recipientId ? null : workflow.recipientRole,
        title,
        message,
        type,
        relatedId,
        relatedModel,
        isRead: false
      });
      console.log(`[Notification] Created in-app alert for type: ${type}`);
    }

    // 4. Send Email if enabled in workflow
    if (workflow.emailEnabled) {
      if (type === "submission_confirmation" && recipientEmail) {
        const subject = `Application Confirmed: ${data.jobTitle || "Job Application"}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Application Confirmed</h2>
            <p>Dear ${recipientName},</p>
            <p>Thank you for applying. We have successfully received your application for <strong>${data.jobTitle || "the position"}</strong>.</p>
            <p>You can visit <a href="https://jobbridgenode.com" style="color: #4f46e5; text-decoration: underline;">jobbridgenode.com</a> to track the status of your application directly from your dashboard.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Best regards,<br />Job Bridge Karnataka Team</p>
          </div>
        `;
        await sendEmail(recipientEmail, subject, html);
      } 
      else if (type === "mentor_acceptance" && recipientEmail) {
        const subject = `Mentor Connection Accepted: ${data.mentorName || "Your Mentor"}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #10b981; margin-bottom: 20px;">Connection Request Accepted</h2>
            <p>Dear ${recipientName},</p>
            <p>We are pleased to inform you that mentor <strong>${data.mentorName || "Your Mentor"}</strong> has accepted your connection request.</p>
            <p style="margin-top: 10px;">You can now reach out to them at <strong>${data.mentorEmail || ""}</strong> ${data.mentorPhone ? `or call them at <strong>${data.mentorPhone}</strong>` : ''}.</p>
            <p>Please visit <a href="https://jobbridgenode.com" style="color: #10b981; text-decoration: underline;">jobbridgenode.com</a> to view details.</p>
            <p>We wish you a productive mentoring relationship!</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Best regards,<br />Job Bridge Karnataka Team</p>
          </div>
        `;
        await sendEmail(recipientEmail, subject, html);
      }
      else if (type === "meeting_schedule" && recipientEmail) {
        const subject = `Meeting Scheduled with Mentor: ${data.mentorName || "Your Mentor"}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Meeting Scheduled</h2>
            <p>Dear ${recipientName},</p>
            <p>A meeting has been scheduled with your mentor <strong>${data.mentorName || "Your Mentor"}</strong>.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4f46e5;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${data.meetingDate}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${data.meetingTime}</p>
              <p style="margin: 5px 0;"><strong>Domain:</strong> ${data.domain || "-"}</p>
              <p style="margin: 5px 0;"><strong>Skill:</strong> ${data.skill || "-"}</p>
              <p style="margin: 5px 0;"><strong>Message:</strong> ${data.meetingMessage}</p>
              <p style="margin: 5px 0;"><strong>Meeting Link:</strong> <a href="${data.meetingLink}" style="color: #4f46e5; text-decoration: underline;">${data.meetingLink}</a></p>
            </div>
            <p>Please visit <a href="https://jobbridgenode.com" style="color: #4f46e5; text-decoration: underline;">jobbridgenode.com</a> to view details.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Best regards,<br />Job Bridge Karnataka Team</p>
          </div>
        `;
        await sendEmail(recipientEmail, subject, html);
      }
      else if (type === "status_update" && recipientEmail) {
        await sendStatusUpdateNotification(
          recipientEmail,
          recipientName,
          data.jobTitle || "Job Position",
          data.newStatus || "Updated Status"
        );
      } 
      else if (type === "interview_notification" && recipientEmail) {
        const subject = `Interview Scheduled: ${data.jobTitle || "Job Application"}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-bottom: 20px;">Interview Invitation</h2>
            <p>Dear ${recipientName},</p>
            <p>Great news! You have been scheduled for an interview for the <strong>${data.jobTitle || "Job Position"}</strong> role.</p>
            ${data.interviewDetails ? `<p><strong>Details:</strong> ${data.interviewDetails}</p>` : ''}
            <p>Please visit <a href="https://jobbridgenode.com" style="color: #4f46e5; text-decoration: underline;">jobbridgenode.com</a> to check your dashboard and review further instructions.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Best regards,<br />Job Bridge Karnataka Team</p>
          </div>
        `;
        await sendEmail(recipientEmail, subject, html);
      } 
      else if (type === "new_application") {
        const adminEmail = process.env.ADMIN_EMAIL || "jobbridgekarnataka@gmail.com";
        await sendAdminApplicationNotification(
          adminEmail,
          {
            name: data.candidateName || "A candidate",
            email: data.candidateEmail || "No email provided"
          },
          data.jobTitle || "Job Post"
        );
      }
      else if (type === "new_job_post") {
        // Send email broadcast alert to active candidates/members
        const standardUsers = await User.find({ role: { $in: ["Candidate", "Job", "Member"] } });
        const googleUsers = await GoogleUser.find({ role: { $in: ["Candidate", "Job", "Member"] } });
        const targetUsers = [...standardUsers, ...googleUsers];
        const emails = targetUsers.map(u => u.username).filter(email => email && email.includes("@"));
        
        if (emails.length > 0) {
          const subject = `New Job Opportunity: ${data.jobTitle || "Job Openings"}`;
          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #4f46e5; margin-bottom: 20px;">New Job Posted</h2>
              <p>Hi there,</p>
              <p>A new job opportunity has been posted that might interest you:</p>
              <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Role:</strong> ${data.jobTitle || "N/A"}</p>
                <p style="margin: 5px 0;"><strong>Company:</strong> ${data.companyName || "N/A"}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${data.location || "N/A"}</p>
              </div>
              <p>Please visit <a href="https://jobbridgenode.com" style="color: #4f46e5; text-decoration: underline;">jobbridgenode.com</a> to log in to your dashboard and apply!</p>
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="font-size: 12px; color: #64748b;">Best regards,<br />Job Bridge Karnataka Team</p>
            </div>
          `;

          // Batch emails to bypass single envelope limits in Brevo
          const SibApiV3Sdk = require("@getbrevo/brevo");
          const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
          apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
          const sender = { email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME };

          const batchSize = 90;
          for (let i = 0; i < emails.length; i += batchSize) {
            const batch = emails.slice(i, i + batchSize);
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
            sendSmtpEmail.subject = subject;
            sendSmtpEmail.htmlContent = html;
            sendSmtpEmail.sender = sender;
            sendSmtpEmail.to = batch.map(email => ({ email }));
            try {
              await apiInstance.sendTransacEmail(sendSmtpEmail);
            } catch (err) {
              console.error(`[Notification] Bulk email batch failed: ${err.message}`);
            }
          }
        }
      }
      else if (type === "pending_action" || type === "system_notification") {
        const adminEmail = process.env.ADMIN_EMAIL || "jobbridgekarnataka@gmail.com";
        const subject = `Admin Alert: ${title}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #e11d48; margin-bottom: 20px;">Admin Action Required</h2>
            <p>An event requiring your attention has occurred:</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #e11d48;">
              <p style="margin: 0; font-weight: bold;">${title}</p>
              <p style="margin: 10px 0 0 0; color: #475569;">${message}</p>
            </div>
            <p>Please visit <a href="https://jobbridgenode.com" style="color: #e11d48; text-decoration: underline;">jobbridgenode.com</a> and log in to your Admin Dashboard to complete the action.</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Job Bridge Karnataka System</p>
          </div>
        `;
        await sendEmail(adminEmail, subject, html);
      }
    }
  } catch (error) {
    console.error("❌ Failed to process triggerNotification:", error);
  }
};

module.exports = { triggerNotification };

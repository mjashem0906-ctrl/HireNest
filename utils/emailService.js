const SibApiV3Sdk = require("@getbrevo/brevo");
const dotenv = require("dotenv");

dotenv.config();

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sender = {
  email: process.env.BREVO_SENDER_EMAIL,
  name: process.env.BREVO_SENDER_NAME,
};

/**
 * Send a single email
 */
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = [{ email: to }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const messageId = data?.body?.messageId || data?.messageId;
    console.log("Email sent successfully:", messageId);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Send bulk email (using BCC or individual calls depending on Brevo limit)
 * For simplicity, we loop or use BCC. Brevo allows up to 99 recipients in 'to'.
 */
const sendBulkEmail = async (toEmails, subject, htmlContent) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = toEmails.map(email => ({ email }));

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    const messageId = data?.body?.messageId || data?.messageId;
    console.log("Bulk email sent successfully:", messageId);
    return data;
  } catch (error) {
    console.error("Error sending bulk email:", error);
    throw error;
  }
};

// /**
//  * Notify members about a new job post
//  */
// const sendJobPostNotification = async (jobDetails, members) => {
//   const subject = `New Job Opportunity: ${jobDetails.title} at ${jobDetails.companyName}`;
//   const htmlContent = `
//     <h1>New Job Opportunity</h1>
//     <p>Hi,</p>
//     <p>A new job has been posted that might interest you:</p>
//     <ul>
//       <li><strong>Title:</strong> ${jobDetails.title}</li>
//       <li><strong>Company:</strong> ${jobDetails.companyName}</li>
//       <li><strong>Location:</strong> ${jobDetails.location}</li>
//       <li><strong>Experience:</strong> ${jobDetails.experience}</li>
//       <li><strong>Salary:</strong> ${jobDetails.salary}</li>
//     </ul>
//     <p>Login to your dashboard to apply!</p>
//     <p>Best regards,<br>Job Bridge Karnataka Team</p>
//   `;

//   // Filter members with valid emails
//   const emails = members
//     .map(m => m.email)
//     .filter(email => email && email.includes("@"));

//   if (emails.length === 0) return;

//   // Batch emails in groups of 90 (Brevo limit is ~100)
//   const batchSize = 90;
//   for (let i = 0; i < emails.length; i += batchSize) {
//     const batch = emails.slice(i, i + batchSize);
//     await sendBulkEmail(batch, subject, htmlContent);
//   }
// };

/**
 * Notify member about status update
 */
const sendStatusUpdateNotification = async (memberEmail, memberName, jobTitle, newStatus) => {
  const subject = `Update on your application for ${jobTitle}`;
  const htmlContent = `
    <h1>Application Status Update</h1>
    <p>Dear ${memberName},</p>
    <p>The status of your application for <strong>${jobTitle}</strong> has been updated to: <strong>${newStatus}</strong>.</p>
    <p>Please visit <a href="https://jobbridgenode.com" style="color: #4f46e5; text-decoration: underline;">jobbridgenode.com</a> to check your dashboard for more details.</p>
    <p>Best regards,<br>Job Bridge Node Karnataka Team</p>
  `;

  await sendEmail(memberEmail, subject, htmlContent);
};

/**
 * Notify Admin about a new job application
 */
const sendAdminApplicationNotification = async (adminEmail, candidateInfo, jobTitle) => {
  // We use candidateInfo.name and candidateInfo.email based on what we send from the controller
  const subject = `New Application Received: ${jobTitle}`;

  const htmlContent = `
    <h1>New Job Application</h1>
    <p>A new candidate has applied for a position.</p>
    <ul>
      <li><strong>Candidate Name:</strong> ${candidateInfo.name}</li>
      <li><strong>Candidate Email:</strong> ${candidateInfo.email}</li>
      <li><strong>Job Title:</strong> ${jobTitle}</li>
      <li><strong>Applied On:</strong> ${new Date().toLocaleDateString('en-GB')}</li>
    </ul>
    <p>Please visit <a href="https://jobbridgenode.com" style="color: #4f46e5; text-decoration: underline;">jobbridgenode.com</a> and log in to the admin panel to review the application.</p>
  `;

  await sendEmail(adminEmail, subject, htmlContent);
};

/**
 * Notify Admin about successful password change
 */
const sendAdminPasswordChangedNotification = async (adminEmail, adminName) => {
  const subject = `Your Admin Password has been updated`;

  const htmlContent = `
    <h1>Password Change Successful</h1>
    <p>Dear ${adminName},</p>
    <p>This is to confirm that the password for your admin account has been successfully updated.</p>
    <p>If you did not make this change, please contact support immediately.</p>
    <p>Best regards,<br>Job Bridge Karnataka Team</p>
  `;

  await sendEmail(adminEmail, subject, htmlContent);
};

/**
 * Send OTP for Admin Password Reset
 */
const sendAdminOtpEmail = async (adminEmail, otp) => {
  const subject = `Your Admin Password Reset OTP - Job Bridge`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #e11d48; margin-top: 0;">Admin Password Reset</h2>
      <p>Hello Admin,</p>
      <p>You requested to change your admin password. Please use the following 6-digit OTP to complete your verification:</p>
      <div style="background-color: #f4f4f5; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #111827;">${otp}</span>
      </div>
      <p>This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
      <p style="color: #6b7280; font-size: 0.85rem; margin-top: 24px;">If you did not request a password change, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="color: #9ca3af; font-size: 0.8rem;">Job Bridge Karnataka Team</p>
    </div>
  `;

  await sendEmail(adminEmail, subject, htmlContent);
};

module.exports = {
  sendEmail,
  sendStatusUpdateNotification,
  sendAdminApplicationNotification,
  sendAdminPasswordChangedNotification,
  sendAdminOtpEmail,
};
// module.exports = {
//   sendEmail,
//   // sendBulkEmail,
//   sendStatusUpdateNotification,
// };
//sendJobPostNotification,

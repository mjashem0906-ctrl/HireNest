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
    console.log("Email sent successfully:", data.messageId);
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
    console.log("Bulk email sent successfully:", data.messageId);
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
    <p>Please check your dashboard for more details.</p>
    <p>Best regards,<br>Job Bridge Karnataka Team</p>
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
    <p>Please log in to the admin panel to review the application.</p>
  `;

  await sendEmail(adminEmail, subject, htmlContent);
};

module.exports = {
  sendEmail,
  sendStatusUpdateNotification,
  sendAdminApplicationNotification, 
};
// module.exports = {
//   sendEmail,
//   // sendBulkEmail,
//   sendStatusUpdateNotification,
// };
//sendJobPostNotification,

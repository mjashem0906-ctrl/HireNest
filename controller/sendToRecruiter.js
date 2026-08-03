const fs = require("fs");
const path = require("path");
const SibApiV3Sdk = require("@getbrevo/brevo");
require("dotenv").config();

const Member = require("../models/member");
const Job = require("../models/job");
const Service = Job;
const Recruiter = require("../models/Recruiter");

// Initialize Brevo API
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

const sender = {
  email: process.env.BREVO_SENDER_EMAIL,
  name: process.env.BREVO_SENDER_NAME,
};

/**
 * POST /api/send-to-recruiter
 * Body: { memberId, jobId, recruiterId }
 *
 * Sends a candidate's profile + resume to a recruiter via email (Brevo).
 * Admin only.
 */
const sendCandidateToRecruiter = async (req, res) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only Admins can perform this action.",
      });
    }

    const { memberId, jobId, recruiterId, customText } = req.body;

    if (!memberId || !recruiterId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "memberId, jobId and recruiterId are required",
      });
    }

    // --- Fetch data ---
    const [member, recruiter, service] = await Promise.all([
      Member.findById(memberId),
      Recruiter.findById(recruiterId),
      Service.findById(jobId).select("title appliedMembers"),
    ]);

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found" });
    }
    if (!recruiter) {
      return res.status(404).json({ success: false, message: "Recruiter not found" });
    }

    const jobTitle = service?.title || "the position";
    const candidateName = member.name || "Candidate";
    const qualification = member.highest_education || member.highestEducationSpecialization || "N/A";
    const experience = member.workExp || "Fresher";
    const location = member.district || member.address || "N/A";
    const phone = member.mobileNumber || "N/A";
    const email = member.email || "N/A";

    // --- Identify the correct resume link ---
    const applicantEntry = service?.appliedMembers?.find(
      (app) => String(app.memberId) === String(memberId)
    );
    const targetResumeLink = applicantEntry?.resumeLink || member.resumeLink;

    let resumeUrl = "";
    if (targetResumeLink) {
      if (targetResumeLink.startsWith("http")) {
        resumeUrl = targetResumeLink;
      } else {
        const backendHost = process.env.BACKEND_URL || `${req.protocol}://${req.get("host")}`;
        resumeUrl = `${backendHost}/${targetResumeLink.replace(/\\/g, "/")}`;
      }
    }

    const resumeHtml = resumeUrl
      ? `<br/><br/><p style="background:#fef2f2; padding:12px; border-radius:8px; border:1px solid #fecaca;">
           <strong>📎 Candidate Resume:</strong> <a href="${resumeUrl}" target="_blank" style="color:#be123c; text-decoration:none; font-weight:bold;">Click here to view/download resume</a>
         </p>`
      : `<br/><br/><p style="color:#64748b; font-size:13px;"><em>No resume available for this candidate.</em></p>`;

    // --- Build professional HTML email body ---
    // --- Build professional HTML email body ---
    let htmlContent = "";

    if (customText !== undefined) {
      const safeText = customText
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")
        .replace(/\n/g, "<br/>");

      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #1a1a1a; background: #f4f6f9; margin: 0; padding: 0; }
    .wrapper { max-width: 620px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #be123c 0%, #9f1239 100%); padding: 32px 36px; color: #fff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.88; }
    .body { padding: 32px 36px; font-size: 14.5px; line-height: 1.75; color: #334155; white-space: pre-wrap; word-break: break-word; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Job Bridge Node — Candidate Profile</h1>
      <p>Connecting Talent with Opportunities</p>
    </div>
    <div class="body">${safeText}${resumeHtml}</div>
  </div>
</body>
</html>`;
    } else {
      htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Arial, sans-serif; color: #1a1a1a; background: #f4f6f9; margin: 0; padding: 0; }
    .wrapper { max-width: 620px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #be123c 0%, #9f1239 100%); padding: 32px 36px; color: #fff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.88; }
    .body { padding: 32px 36px; font-size: 14.5px; line-height: 1.75; color: #334155; }
    .footer { background: #f8fafc; padding: 24px 36px; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 3px 0; font-size: 13px; color: #64748b; }
    .footer strong { color: #be123c; font-size: 15px; display: block; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Job Bridge Node — Candidate Profile</h1>
      <p>Connecting Talent with Opportunities</p>
    </div>
    <div class="body">
      <p>Dear Recruiter,</p>
      <p>Greetings from <em>Job Bridge Node</em>.</p>
      <p>We are pleased to share the profile of a candidate who has applied for the position of <strong>${jobTitle}</strong> at your organization through our Job Bridge Node platform.</p>
      <p>Please find the candidate's resume attached for your review.</p>
      
      ${resumeHtml}

      <p><strong>Candidate Details:</strong><br/>
      &bull; Name: ${candidateName}<br/>
      &bull; Position Applied: ${jobTitle}<br/>
      &bull; Qualification: ${qualification}<br/>
      &bull; Experience: ${experience}<br/>
      &bull; Location: ${location}</p>

      <p>We believe the candidate's profile aligns with the requirements of the position and request you to kindly review the application and consider them for the further selection process.</p>
      <p>Should you require any additional information or assistance, please feel free to contact us.</p>
      <p>Thank you for your time and consideration.</p>
      
      <p>Best Regards,</p>
    </div>
    <div class="footer">
      <strong>Job Bridge Node Team</strong>
      <p>Connecting Talent with Opportunities</p>
      <p>📧 info.jobbridge@solidaritykarnataka.org</p>
      <p>📞 6366234200</p>
      <p>🌐 Job Bridge Node</p>
    </div>
  </div>
</body>
</html>`;
    }

    // --- Build SendSmtpEmail object ---
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = `Candidate Profile: ${candidateName} — Applied for ${jobTitle}`;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = sender;
    sendSmtpEmail.to = [{ email: recruiter.email, name: recruiter.fullName }];
    // CC to sender (record keeping)
    sendSmtpEmail.cc = [{ email: process.env.BREVO_SENDER_EMAIL, name: process.env.BREVO_SENDER_NAME }];

    // --- Send email ---
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Candidate email sent to recruiter:", data.messageId);

    return res.status(200).json({
      success: true,
      message: `Email sent to ${recruiter.fullName} (${recruiter.email}) successfully`,
      messageId: data.messageId,
    });
  } catch (error) {
    console.error("sendCandidateToRecruiter error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.message,
    });
  }
};

module.exports = { sendCandidateToRecruiter };

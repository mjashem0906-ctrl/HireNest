const Job = require("../models/job");
const Member = require("../models/member");
const JobEmailNotification = require("../models/JobEmailNotification");
const { sendEmail } = require("../utils/emailService");
const dotenv = require("dotenv");

dotenv.config();

// Canonical skill aliases map for normalization
const SKILL_ALIASES = {
  "react.js": "react",
  "reactjs": "react",
  "react js": "react",
  "react": "react",
  "node.js": "node.js",
  "nodejs": "node.js",
  "node js": "node.js",
  "node": "node.js",
  "next.js": "next.js",
  "nextjs": "next.js",
  "next js": "next.js",
  "next": "next.js",
  "vue.js": "vue.js",
  "vuejs": "vue.js",
  "vue js": "vue.js",
  "vue": "vue.js",
  "angular.js": "angular",
  "angularjs": "angular",
  "angular js": "angular",
  "angular": "angular",
  "express.js": "express.js",
  "expressjs": "express.js",
  "express js": "express.js",
  "express": "express.js",
  "mongodb": "mongodb",
  "mongo db": "mongodb",
  "mongo": "mongodb",
  "postgresql": "postgresql",
  "postgres": "postgresql",
  "postgres sql": "postgresql",
  "mysql": "mysql",
  "my sql": "mysql",
  "mssql": "sql server",
  "ms sql": "sql server",
  "sql server": "sql server",
  "javascript": "javascript",
  "js": "javascript",
  "typescript": "typescript",
  "ts": "typescript",
  "html5": "html",
  "html": "html",
  "css3": "css",
  "css": "css",
  "scss": "scss",
  "sass": "sass",
  "tailwind": "tailwind css",
  "tailwindcss": "tailwind css",
  "tailwind css": "tailwind css",
  "bootstrap": "bootstrap",
  "aws": "aws",
  "amazon web services": "aws",
  "gcp": "gcp",
  "google cloud": "gcp",
  "google cloud platform": "gcp",
  "azure": "azure",
  "microsoft azure": "azure",
  "ci/cd": "ci/cd",
  "cicd": "ci/cd",
  "ci cd": "ci/cd",
  "rest": "rest api",
  "rest api": "rest api",
  "restful": "rest api",
  "restful api": "rest api",
  "restful apis": "rest api",
  "ui/ux": "ui/ux",
  "ui ux": "ui/ux",
  "ui design": "ui/ux",
  "ux design": "ui/ux",
  "python": "python",
  "py": "python",
  "java": "java",
  "c++": "c++",
  "cpp": "c++",
  "c#": "c#",
  "csharp": "c#",
  "c sharp": "c#",
  ".net": ".net",
  "dotnet": ".net",
  "dot net": ".net",
  "asp.net": "asp.net",
  "aspnet": "asp.net",
  "php": "php",
  "laravel": "laravel",
  "django": "django",
  "flask": "flask",
  "spring": "spring boot",
  "spring boot": "spring boot",
  "springboot": "spring boot",
  "docker": "docker",
  "kubernetes": "kubernetes",
  "k8s": "kubernetes",
  "git": "git",
  "github": "github",
  "gitlab": "gitlab",
  "graphql": "graphql",
  "redux": "redux",
  "machine learning": "machine learning",
  "ml": "machine learning",
  "artificial intelligence": "artificial intelligence",
  "ai": "artificial intelligence",
  "data science": "data science",
  "data analysis": "data analysis",
  "power bi": "power bi",
  "powerbi": "power bi",
  "tableau": "tableau",
  "excel": "excel",
  "ms excel": "excel",
  "advanced excel": "excel",
};

// Common filler/level words to ignore during role token matching
const ROLE_STOP_WORDS = new Set([
  "and", "or", "the", "a", "an", "in", "of", "for", "at", "to", "with", "&", "/", "-",
  "level", "senior", "junior", "lead", "associate", "intern", "fresher", "executive",
  "specialist", "staff", "consultant", "sr", "jr", "expert", "manager", "trainee", "entry"
]);

/**
 * Helper to safely flatten and extract string array from any input
 */
const toCleanArray = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input
      .flat(Infinity)
      .map((item) => (typeof item === "string" ? item.trim() : String(item || "").trim()))
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/[,;\n\r]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

/**
 * Normalize and canonicalize a single skill
 */
const canonicalizeSkill = (rawSkill) => {
  if (!rawSkill || typeof rawSkill !== "string") return "";
  const cleaned = rawSkill
    .toLowerCase()
    .trim()
    .replace(/^[-•*\s]+/, "")
    .replace(/[-•*\s]+$/, "");

  if (!cleaned) return "";

  // Check direct alias
  if (SKILL_ALIASES[cleaned]) {
    return SKILL_ALIASES[cleaned];
  }

  // Strip trailing .js or js if preceded by common tech words
  const jsCleaned = cleaned.replace(/\s*(?:\.js|js)$/i, "").trim();
  if (jsCleaned && SKILL_ALIASES[jsCleaned]) {
    return SKILL_ALIASES[jsCleaned];
  }

  return cleaned;
};

/**
 * Extract deduplicated canonical skill set from string or array
 */
const extractCanonicalSkills = (skillsInput) => {
  const rawList = toCleanArray(skillsInput);
  const canonicalSet = new Set();
  const canonicalList = [];

  for (const item of rawList) {
    // If an item has multiple comma or slash separated items
    const subParts = item.split(/[,;/]+/).map((s) => s.trim()).filter(Boolean);
    for (const part of subParts) {
      const canonical = canonicalizeSkill(part);
      if (canonical && !canonicalSet.has(canonical)) {
        canonicalSet.add(canonical);
        canonicalList.push(canonical);
      }
    }
  }

  return canonicalList;
};

/**
 * Normalize role string for comparison
 */
const normalizeRoleString = (roleStr) => {
  if (!roleStr || typeof roleStr !== "string") return "";
  return roleStr
    .toLowerCase()
    .replace(/[^\w\s/&-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * Check if a seeker's preferred role matches the job role
 */
const isRoleMatch = (seekerRole, jobRole) => {
  const normSeeker = normalizeRoleString(seekerRole);
  const normJob = normalizeRoleString(jobRole);

  if (!normSeeker || !normJob) return false;

  // 1. Exact normalized match
  if (normSeeker === normJob) return true;

  // 2. Substring containment (e.g. "React Frontend Developer" includes "Frontend Developer")
  if (normJob.includes(normSeeker) || normSeeker.includes(normJob)) {
    return true;
  }

  // 3. Significant token matching (handling "Software Engineer" vs "Software Developer", etc.)
  const seekerTokens = normSeeker
    .split(/\s+/)
    .filter((t) => t.length > 1 && !ROLE_STOP_WORDS.has(t));

  const jobTokens = normJob
    .split(/\s+/)
    .filter((t) => t.length > 1 && !ROLE_STOP_WORDS.has(t));

  if (seekerTokens.length === 0 || jobTokens.length === 0) return false;

  // Check synonym mappings for common role components
  const normalizeRoleToken = (t) => {
    if (["engineer", "developer", "programmer", "coder"].includes(t)) return "dev";
    if (["designer", "ui/ux", "ui", "ux"].includes(t)) return "design";
    if (["analyst", "analytics"].includes(t)) return "analyst";
    if (["administrator", "admin"].includes(t)) return "admin";
    if (["specialist", "expert", "consultant"].includes(t)) return "specialist";
    if (["frontend", "front-end"].includes(t)) return "frontend";
    if (["backend", "back-end"].includes(t)) return "backend";
    if (["fullstack", "full-stack"].includes(t)) return "fullstack";
    return t;
  };

  const normSeekerTokens = seekerTokens.map(normalizeRoleToken);
  const normJobTokens = jobTokens.map(normalizeRoleToken);

  // If all non-stop seeker tokens match in job tokens or vice-versa
  const seekerInJob = normSeekerTokens.every((t) => normJobTokens.includes(t));
  const jobInSeeker = normJobTokens.every((t) => normSeekerTokens.includes(t));

  if (seekerInJob || jobInSeeker) return true;

  // If they share at least 2 significant tokens or a distinctive multi-part domain keyword
  const sharedTokens = normSeekerTokens.filter((t) => normJobTokens.includes(t));
  if (sharedTokens.length >= 2) return true;

  // Distinctive single high-specificity domain keywords
  const specificDomains = new Set([
    "react", "angular", "vue", "flutter", "devops", "qa", "tester", "salesforce",
    "accountant", "pharmacist", "nurse", "electrician", "plumber", "lawyer",
    "copywriter", "recruiter", "telecaller", "receptionist", "driver"
  ]);

  if (sharedTokens.length === 1 && specificDomains.has(sharedTokens[0])) {
    return true;
  }

  return false;
};

/**
 * Evaluates match between a candidate member and a job post
 */
const evaluateCandidateJobMatch = (member, job) => {
  if (!member || !job) {
    return { isMatch: false };
  }

  // Seeker Roles
  const seekerRoles = [
    ...toCleanArray(member.preferredJobRole_Sector),
    ...toCleanArray(member.careerProfile?.role),
  ];

  // Seeker Skills
  const seekerSkills = [
    ...toCleanArray(member.skills),
    ...toCleanArray(member.skillsToImprove),
  ];

  const canonicalSeekerSkills = extractCanonicalSkills(seekerSkills);
  const canonicalJobSkills = extractCanonicalSkills(job.keySkills);

  const jobRole = job.role || job.title || "";

  // 1. Role Match Check
  let matchedRole = "";
  let isRoleMatched = false;

  if (seekerRoles.length === 0) {
    // If no explicit role is set, check if seeker's designation or profession matches
    if (member.designation && isRoleMatch(member.designation, jobRole)) {
      isRoleMatched = true;
      matchedRole = member.designation;
    } else if (member.profession && isRoleMatch(member.profession, jobRole)) {
      isRoleMatched = true;
      matchedRole = member.profession;
    }
  } else {
    for (const sRole of seekerRoles) {
      if (isRoleMatch(sRole, jobRole)) {
        isRoleMatched = true;
        matchedRole = sRole;
        break;
      }
    }
  }

  // 2. Skill Match Check (Intersection of canonical skills)
  const matchedSkills = canonicalSeekerSkills.filter((seekerSkill) =>
    canonicalJobSkills.some((jobSkill) => {
      // Exact canonical token comparison prevents false matches like Java vs JavaScript, C vs C++
      return seekerSkill === jobSkill;
    })
  );

  const isSkillMatched = matchedSkills.length > 0;

  return {
    isMatch: isRoleMatched && isSkillMatched,
    isRoleMatched,
    isSkillMatched,
    matchedRole,
    matchedSkills,
    seekerSkills: canonicalSeekerSkills,
    jobSkills: canonicalJobSkills,
    seekerRoles,
    jobRole,
  };
};

/**
 * Generate formatted HTML template for Job Notification Email
 */
const generateJobNotificationEmailHtml = ({
  candidateName,
  job,
  matchedRole,
  matchedSkills,
  portalUrl,
}) => {
  const clientUrl = portalUrl || process.env.CLIENT_URL || "https://jobbridge.com";
  const jobLink = `${clientUrl.replace(/\/+$/, "")}/jobs`;

  const companyName = job.companyName || "Verified Employer";
  const location = job.location || "Not Specified";
  const employmentType = job.employmentType || "Full-time";
  const experience = job.experience || "Not Specified";
  const salary = job.salary || "Competitive";
  const role = job.role || job.title;

  let formattedEndDate = "Open until filled";
  if (job.applicationEndDate) {
    try {
      const d = new Date(job.applicationEndDate);
      if (!isNaN(d.getTime())) {
        formattedEndDate = d.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
    } catch {
      // fallback to default
    }
  }

  const rawJobSkills = toCleanArray(job.keySkills);
  const skillsHtml = rawJobSkills.length > 0
    ? rawJobSkills
        .map((s) => {
          const isMatched = matchedSkills.some((ms) =>
            canonicalizeSkill(s) === ms
          );
          return `<span style="display: inline-block; background-color: ${isMatched ? '#dcfce7' : '#f1f5f9'}; color: ${isMatched ? '#166534' : '#475569'}; border: 1px solid ${isMatched ? '#86efac' : '#cbd5e1'}; padding: 4px 10px; border-radius: 9999px; font-size: 12px; margin: 3px; font-weight: ${isMatched ? '700' : '500'};">${s}${isMatched ? ' ✓' : ''}</span>`;
        })
        .join(" ")
    : "<span>Not Specified</span>";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Matching Job Opportunity</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; color: #1e293b; line-height: 1.6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 0;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 28px 32px; text-align: left;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px;">JobBridge</h1>
                  <p style="color: #ffe4e6; margin: 6px 0 0 0; font-size: 14px;">Personalized Job Match Alert</p>
                </td>
              </tr>

              <!-- Greeting & Match Summary -->
              <tr>
                <td style="padding: 28px 32px 16px 32px;">
                  <p style="font-size: 16px; margin: 0 0 12px 0;">Dear <strong>${candidateName || "Job Seeker"}</strong>,</p>
                  <p style="font-size: 14px; color: #475569; margin: 0 0 20px 0;">
                    A new job opportunity matching your preferred role <strong>"${matchedRole || role}"</strong> and key skills has just been posted on JobBridge Portal!
                  </p>
                </td>
              </tr>

              <!-- Job Details Card -->
              <tr>
                <td style="padding: 0 32px 24px 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px;">
                    <tr>
                      <td style="padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
                        <h2 style="margin: 0 0 4px 0; font-size: 18px; color: #0f172a; font-weight: 700;">${job.title}</h2>
                        <p style="margin: 0; font-size: 14px; color: #e11d48; font-weight: 600;">${companyName}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-top: 16px;">
                        <table width="100%" cellpadding="4" cellspacing="0" style="font-size: 13px; color: #334155;">
                          <tr>
                            <td width="30%" style="font-weight: 600; color: #64748b;">Job Role:</td>
                            <td width="70%" style="font-weight: 600; color: #0f172a;">${role}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: 600; color: #64748b;">Employment Type:</td>
                            <td>${employmentType}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: 600; color: #64748b;">Location:</td>
                            <td>${location}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: 600; color: #64748b;">Experience:</td>
                            <td>${experience}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: 600; color: #64748b;">Salary:</td>
                            <td>${salary}</td>
                          </tr>
                          <tr>
                            <td style="font-weight: 600; color: #64748b;">Application Deadline:</td>
                            <td><strong style="color: #b91c1c;">${formattedEndDate}</strong></td>
                          </tr>
                          <tr>
                            <td style="font-weight: 600; color: #64748b; vertical-align: top; padding-top: 8px;">Required Skills:</td>
                            <td style="padding-top: 8px;">
                              ${skillsHtml}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Call to Action Button -->
              <tr>
                <td style="padding: 0 32px 32px 32px; text-align: center;">
                  <a href="${jobLink}" target="_blank" style="display: inline-block; background-color: #e11d48; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(225, 29, 72, 0.3); letter-spacing: 0.3px;">
                    Apply Now on JobBridge
                  </a>
                  <p style="font-size: 12px; color: #94a3b8; margin: 12px 0 0 0;">
                    Or log in directly at <a href="${clientUrl}" style="color: #e11d48; text-decoration: underline;">${clientUrl}</a> to review this position.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f1f5f9; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="font-size: 12px; color: #64748b; margin: 0 0 4px 0;">
                    You are receiving this automated email because your profile matches this job opening on JobBridge Portal.
                  </p>
                  <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                    © ${new Date().getFullYear()} JobBridge. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Main function: Process job matching against Job Seekers and dispatch emails
 * 
 * @param {string|mongoose.Types.ObjectId} jobId
 * @returns {Promise<{matched: number, sent: number, failed: number, skipped: number}>}
 */
const processJobMatchAndNotify = async (jobId) => {
  const summary = {
    matched: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  };

  try {
    if (!jobId) {
      console.warn("[JobMatchNotification] No jobId provided. Aborting notification.");
      return summary;
    }

    // 1. Fetch Job from MongoDB
    const job = await Job.findById(jobId).lean();
    if (!job) {
      console.warn(`[JobMatchNotification] Job not found with ID: ${jobId}`);
      return summary;
    }

    const jobIdentifier = job.jobId || String(job._id);

    // Guard: Do not send emails for inactive, deleted, expired, draft, or invalid jobs
    if (job.isActive === false) {
      console.log(`[JobMatchNotification] Job "${jobIdentifier}" is inactive. Skipping notifications.`);
      return summary;
    }

    if (job.applicationEndDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(job.applicationEndDate);
      endDate.setHours(0, 0, 0, 0);
      if (endDate < today) {
        console.log(`[JobMatchNotification] Job "${jobIdentifier}" applicationEndDate has passed. Skipping notifications.`);
        return summary;
      }
    }

    if (!job.role || !job.role.trim() || !job.keySkills || !String(job.keySkills).trim()) {
      console.log(`[JobMatchNotification] Job "${jobIdentifier}" is missing required Job Role or Key Skills. Skipping notifications.`);
      return summary;
    }

    // 2. Fetch all Job Seekers from Member collection
    const seekerQuery = {
      $or: [
        { memberType: { $regex: /seeker|candidate|in need of job/i } },
        { memberType: { $exists: false } },
        { memberType: null },
        { memberType: "" },
      ],
      $and: [
        {
          $or: [
            { email: { $exists: true, $ne: null, $regex: /@/ } },
            { submittingEmail: { $exists: true, $ne: null, $regex: /@/ } },
          ],
        },
      ],
    };

    const members = await Member.find(seekerQuery).lean();

    if (!members || members.length === 0) {
      console.log(`[JobMatchNotification] No Job Seekers found in database. 0 notifications sent.`);
      return summary;
    }

    // 3. Fetch existing notification records for this job to prevent duplicates
    const existingNotifications = await JobEmailNotification.find({
      jobId: job._id,
    }).select("recipientEmail jobSeekerId status").lean();

    const alreadyNotifiedEmails = new Set(
      existingNotifications.map((n) => n.recipientEmail.toLowerCase().trim())
    );
    const alreadyNotifiedSeekerIds = new Set(
      existingNotifications.map((n) => String(n.jobSeekerId))
    );

    // 4. Find matching candidates
    const matchingCandidates = [];

    for (const member of members) {
      const email = (member.email || member.submittingEmail || "").toLowerCase().trim();
      if (!email || !email.includes("@")) continue;

      const evalResult = evaluateCandidateJobMatch(member, job);

      if (evalResult.isMatch) {
        matchingCandidates.push({
          member,
          email,
          evalResult,
        });
      }
    }

    summary.matched = matchingCandidates.length;

    if (matchingCandidates.length === 0) {
      console.log(`[JobMatchNotification] Job "${jobIdentifier}" (${job.title}) - 0 matching Job Seekers found based on Role & Skills. No emails sent.`);
      return summary;
    }

    console.log(`[JobMatchNotification] Job "${jobIdentifier}" (${job.title}) - Found ${matchingCandidates.length} matching Job Seeker(s). Starting notification dispatch...`);

    // 5. Send notification email individually to each matching candidate with atomic claim
    const subject = `New Job Match: ${job.title} at ${job.companyName || "Verified Employer"}`;

    for (const candidate of matchingCandidates) {
      const { member, email, evalResult } = candidate;
      const candidateName = member.name || email.split("@")[0];

      let notificationRecord = null;

      // 5a. Check existing record or atomically claim pending slot
      try {
        const existingRecord = await JobEmailNotification.findOne({
          jobId: job._id,
          recipientEmail: email,
        });

        if (existingRecord) {
          if (existingRecord.status === "sent") {
            summary.skipped++;
            continue;
          }

          if (existingRecord.status === "pending") {
            // If claimed less than 3 minutes ago, active process is handling it
            const claimAge = Date.now() - new Date(existingRecord.updatedAt || existingRecord.sentAt).getTime();
            if (claimAge < 3 * 60 * 1000) {
              summary.skipped++;
              continue;
            }
          }

          // If failed or stale pending, attempt to reclaim for controlled retry
          const reclaimed = await JobEmailNotification.findOneAndUpdate(
            { _id: existingRecord._id, status: { $in: ["failed", "pending"] } },
            { $set: { status: "pending", errorMessage: null, sentAt: new Date() } },
            { new: true }
          );

          if (!reclaimed) {
            summary.skipped++;
            continue;
          }
          notificationRecord = reclaimed;
        } else {
          // Atomically create pending claim record
          notificationRecord = await JobEmailNotification.create({
            jobId: job._id,
            jobSeekerId: member._id,
            recipientEmail: email,
            recipientName: candidateName,
            matchingDetails: {
              matchedRole: evalResult.matchedRole,
              seekerPreferredRoles: evalResult.seekerRoles,
              jobRole: evalResult.jobRole,
              matchedSkills: evalResult.matchedSkills,
              seekerSkills: evalResult.seekerSkills,
              jobSkills: evalResult.jobSkills,
            },
            status: "pending",
            sentAt: new Date(),
          });
        }
      } catch (claimError) {
        // E11000 Duplicate key means another concurrent process claimed this recipient
        if (claimError.code === 11000 || (claimError.message && claimError.message.includes("E11000"))) {
          summary.skipped++;
          continue;
        }
        console.error(`[JobMatchNotification] Error claiming notification slot for ${email}:`, claimError.message);
        summary.failed++;
        continue;
      }

      if (!notificationRecord) {
        summary.skipped++;
        continue;
      }

      // 5b. Generate personalized email and dispatch
      const htmlContent = generateJobNotificationEmailHtml({
        candidateName,
        job,
        matchedRole: evalResult.matchedRole,
        matchedSkills: evalResult.matchedSkills,
        portalUrl: process.env.CLIENT_URL,
      });

      try {
        const sendResult = await sendEmail(email, subject, htmlContent);
        const messageId = sendResult?.body?.messageId || sendResult?.messageId || null;

        // Update record to 'sent'
        await JobEmailNotification.findByIdAndUpdate(notificationRecord._id, {
          status: "sent",
          messageId,
          errorMessage: null,
          sentAt: new Date(),
        });

        summary.sent++;
      } catch (sendError) {
        summary.failed++;
        console.error(`[JobMatchNotification] Failed to send email to ${email} for job "${jobIdentifier}":`, sendError.message || sendError);

        // Update record to 'failed' to allow controlled retry
        try {
          await JobEmailNotification.findByIdAndUpdate(notificationRecord._id, {
            status: "failed",
            errorMessage: sendError.message || "Email dispatch failed",
          });
        } catch (dbError) {
          console.warn(`[JobMatchNotification] Could not update failed status for ${email}:`, dbError.message);
        }
      }
    }

    console.log(`[JobMatchNotification] Job "${jobIdentifier}" (${job.title}) - Summary -> Matched: ${summary.matched}, Sent: ${summary.sent}, Failed: ${summary.failed}, Skipped (Already Sent/Processing): ${summary.skipped}`);

    return summary;
  } catch (error) {
    console.error(`[JobMatchNotification] Unexpected error processing job notifications for job ${jobId}:`, error);
    return summary;
  }
};

module.exports = {
  canonicalizeSkill,
  extractCanonicalSkills,
  normalizeRoleString,
  isRoleMatch,
  evaluateCandidateJobMatch,
  generateJobNotificationEmailHtml,
  processJobMatchAndNotify,
};

const Member = require("../models/member");   // ✅ IMPORTANT for Linux/Vercel case-sensitive
const Activity = require("../models/activity");
const User = require("../models/login");
const Candidate = require("../models/candidate");
const Recruiter = require("../models/Recruiter");
const Referee = require("../models/Referee");
const MemberComments = require("../models/memberComments");
const MentorConnection = require("../models/mentorConnection");
const AssignFor = require("../models/assignFor");
const SubTask = require("../models/subTask");
const Service = require("../models/service");
const StatusChangeRequest = require("../models/StatusChangeRequest");

/* ---------------------------------------
   Get all members
---------------------------------------- */
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ message: "Server error fetching members" });
  }
};

/* ---------------------------------------
   Get member by ID
---------------------------------------- */
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ message: "Server error fetching member" });
  }
};

/* ---------------------------------------
   Add Member
---------------------------------------- */
const addMember = async (req, res) => {
  try {
    const payload = cleanPayload(req.body);

    // Sync Cloudinary/Local upload paths
    if (payload.photo) payload.photoUrl = payload.photo;
    if (payload.resume) payload.resumeLink = payload.resume;

    // ✅ If multipart files exist
    if (req.files) {
      if (req.files.photo) {
        payload.photoUrl = req.files.photo[0].path.replace(/\\/g, "/");
      }
      if (req.files.resume) {
        payload.resumeLink = req.files.resume[0].path.replace(/\\/g, "/");
      }
    }

    // ✅ Certifications: allow array OR JSON string
    if (typeof payload.certifications === "string") {
      try {
        payload.certifications = JSON.parse(payload.certifications);
      } catch (e) {
        payload.certifications = [];
      }
    }
    if (!Array.isArray(payload.certifications)) payload.certifications = [];

    // ✅ passOutYear fallback if old field used
    if (!payload.passOutYear && payload.highestEducationPassedOutYear) {
      payload.passOutYear = payload.highestEducationPassedOutYear;
    }

    // ✅ Auto-generate sequential memberReferenceNumber across Members & Recruiters
    const allMembers = await Member.find().select('memberReferenceNumber');
    const allRecruiters = await Recruiter.find().select('memberReferenceNumber');
    let maxRefNo = 0;
    
    for (const m of [...allMembers, ...allRecruiters]) {
      if (m.memberReferenceNumber) {
        const parsed = parseInt(m.memberReferenceNumber, 10);
        if (!isNaN(parsed) && parsed > maxRefNo) {
          maxRefNo = parsed;
        }
      }
    }
    payload.memberReferenceNumber = (maxRefNo + 1).toString();

    const member = await Member.create(payload);

    await Activity.create({
      type: "MEMBER",
      action: "created",
      meta: { name: member.name },
      targetId: member._id,
    });

    res.status(201).json(member);
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ message: "Server error adding member" });
  }
};

/* ---------------------------------------
   Update Member
---------------------------------------- */
const updateMember = async (req, res) => {
  try {
    const payload = cleanPayload(req.body);

    if (payload.photo) payload.photoUrl = payload.photo;
    if (payload.resume) payload.resumeLink = payload.resume;

    if (req.files) {
      if (req.files.photo) {
        payload.photoUrl = req.files.photo[0].path.replace(/\\/g, "/");
      }
      if (req.files.resume) {
        payload.resumeLink = req.files.resume[0].path.replace(/\\/g, "/");
      }
    }

    // ✅ Certifications: allow array OR JSON string
    if (typeof payload.certifications === "string") {
      try {
        payload.certifications = JSON.parse(payload.certifications);
      } catch (e) {
        payload.certifications = [];
      }
    }
    if (payload.certifications !== undefined && !Array.isArray(payload.certifications)) {
      payload.certifications = [];
    }

    // ✅ passOutYear fallback if old field used
    if (!payload.passOutYear && payload.highestEducationPassedOutYear) {
      payload.passOutYear = payload.highestEducationPassedOutYear;
    }

    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: payload },
      { new: true, runValidators: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(updatedMember);
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ message: "Server error updating member" });
  }
};

/* ---------------------------------------
   Delete Member
---------------------------------------- */
const deleteMember = async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Find the member first to get their email
    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    const memberEmail = member.email;

    // 2. Perform cascading deletes/updates
    await Promise.all([
      // Authentication
      User.deleteMany({ $or: [{ memberId: id }, { username: memberEmail }] }),
      
      // Profiles
      Candidate.deleteMany({ email: memberEmail }),
      Recruiter.deleteMany({ email: memberEmail }),
      Referee.deleteMany({ email: memberEmail }),
      
      // Member-related data
      MemberComments.deleteMany({ memberId: id }),
      MentorConnection.deleteMany({ $or: [{ userMemberId: id }, { mentorMemberId: id }] }),
      AssignFor.deleteMany({ memberId: id }),
      StatusChangeRequest.deleteMany({ requestedBy: id }),
      SubTask.deleteMany({ assignedTo: id }),
      Activity.deleteMany({ targetId: id }),
      
      // Jobs (Service) logic
      // - Delete jobs posted by this member
      Service.deleteMany({ memberId: id }),
      // - Remove this member from appliedMembers in all jobs
      Service.updateMany({}, { $pull: { appliedMembers: { memberId: id } } }),
      // - Unset referral references
      Service.updateMany({ refereedBy: id }, { $set: { refereedBy: null } }),
      
      // Finally delete the member record
      Member.findByIdAndDelete(id)
    ]);

    res.status(200).json({ message: "Member and all associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting member and associated data:", error);
    res.status(500).json({ message: "Server error deleting member data", error: error.message });
  }
};

/* ---------------------------------------
   Google Sheet Sync
---------------------------------------- */
const syncMemberFromSheet = async (req, res) => {
  try {
    const secret = req.headers["x-webhook-secret"];
    if (secret !== process.env.WEBHOOK_SECRET) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    const identifier = { memberReferenceNumber: req.body.memberReferenceNumber };
    const payload = cleanPayload(req.body);

    // ✅ passOutYear fallback
    if (!payload.passOutYear && payload.highestEducationPassedOutYear) {
      payload.passOutYear = payload.highestEducationPassedOutYear;
    }

    const member = await Member.findOneAndUpdate(identifier, payload, {
      new: true,
      upsert: true,
    });

    res.json({ message: "Member synced successfully", member });
  } catch (err) {
    console.error("Sync Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------------------
   Utility: remove undefined values
---------------------------------------- */
function cleanPayload(data) {
  const allowedFields = [
    "name",
    "fathersName",
    "mobileNumber",
    "email",
    "gender",
    "dateOfBirth",
    "memberType",
    "currentInstitutionOrCompany",
    "district",
    "address",
    "photo",
    "resume",
    "photoUrl",
    "resumeLink",
    "forGrouping",
    "nativePlace",
    "profession",
    "age",

    // ✅ Added for Occupation & Company Details
    "occupation",
    "companyDetails",

    // Mentor
    "designation",

    // Job Seeker
    "seekerNeed",
    "highest_education",
    "branch",
    "educationStatus",

    // ✅ NEW: passOutYear (frontend)
    "passOutYear",

    // Existing older fields (keep)
    "highestEducationSpecialization",
    "highestEducationPassedOutYear",

    "fieldofStudy_Interest",
    "preferredJobRole_Sector",
    "employmentType",
    "workExp",
    "relocationStatus",
    "preferredJobLocation",

    // Opportunity Provider
    "jobOfferType",
    "offeringSector",
    "opportunityDescription",
    "offer_Location",
    "contactForSeekers",

    // Referee
    "referrerStatus",
    "referringOfferType",
    "referringSector",
    "referringFor",
    "levelOfSupport",
    "referrerContact",

    // Upskilling
    "interest_SkillBuildingProgram",
    "skillsToImprove",

    // System
    "memberReferenceNumber",
    "symMemberStatus",

    // ✅ Naukri-style fields
    "careerProfile",
    "experienceDetails",
    "certifications",
    "languages",
    "skills",             // <====== ✅ ADDED THIS LINE
    "fatherName",
    "motherName",
    "hometown",
    "pincode",
    "passportNumber",
    "maritalStatus",
  ];

  const payload = {};
  allowedFields.forEach((key) => {
    if (data[key] !== undefined) {
      payload[key] = data[key];
    }
  });

  return payload;
}

module.exports = {
  getAllMembers,
  getMemberById,
  addMember,
  updateMember,
  deleteMember,
  syncMemberFromSheet,
};
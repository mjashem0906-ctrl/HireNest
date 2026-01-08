const Member = require("../models/member");
const Activity = require("../models/activity");

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
   Add Member (Frontend)
---------------------------------------- */
const addMember = async (req, res) => {
  try {
    const payload = cleanPayload(req.body);

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
  try {
    const deleted = await Member.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid member ID", error });
  }
};

/* ---------------------------------------
   Google Sheet Sync (kept separate)
---------------------------------------- */
const syncMemberFromSheet = async (req, res) => {
  try {
    const secret = req.headers["x-webhook-secret"];
    if (secret !== process.env.WEBHOOK_SECRET) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    const identifier = { memberReferenceNumber: req.body.memberReferenceNumber };
    const payload = cleanPayload(req.body);

    const member = await Member.findOneAndUpdate(
      identifier,
      payload,
      { new: true, upsert: true }
    );

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
    // Common
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
    "photoUrl",
    "forGrouping",

    // 👇 ADDED NEW FIELD HERE 👇
    "designation", // For Mentors (Job Role)
    // 👆 This ensures Job Role is saved!

    // Job Seeker
    "seekerNeed",
    "highest_education",
    "fieldofStudy_Interest",
    "preferredJobRole_Sector",
    "workExp",
    "relocationStatus",
    "preferredJobLocation",
    "resumeLink",

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
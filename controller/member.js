
// // //--------------------19/1----------11.54------------------

// // const Member = require("../models/member");
// // const Activity = require("../models/activity");

// // /* ---------------------------------------
// //    Get all members
// // ---------------------------------------- */
// // const getAllMembers = async (req, res) => {
// //   try {
// //     const members = await Member.find().sort({ createdAt: -1 });
// //     res.status(200).json(members);
// //   } catch (error) {
// //     console.error("Error fetching members:", error);
// //     res.status(500).json({ message: "Server error fetching members" });
// //   }
// // };

// // /* ---------------------------------------
// //    Get member by ID
// // ---------------------------------------- */
// // const getMemberById = async (req, res) => {
// //   try {
// //     const member = await Member.findById(req.params.id);
// //     if (!member) {
// //       return res.status(404).json({ message: "Member not found" });
// //     }
// //     res.status(200).json(member);
// //   } catch (error) {
// //     console.error("Error fetching member:", error);
// //     res.status(500).json({ message: "Server error fetching member" });
// //   }
// // };

// // /* ---------------------------------------
// //    Add Member (Frontend)
// // ---------------------------------------- */
// // const addMember = async (req, res) => {
// //   try {
// //     // 1. Get clean text data (Now includes 'photo' and 'resume' URLs)
// //     const payload = cleanPayload(req.body);

// //     // 2. Handle Cloudinary URLs (Backward Compatibility)
// //     // If the frontend sends 'photo', ensure it saves to 'photoUrl' if your Schema uses that
// //     if (payload.photo) payload.photoUrl = payload.photo;
// //     if (payload.resume) payload.resumeLink = payload.resume;

// //     // 3. Handle File Uploads (Fallback for Multer/Local uploads)
// //     if (req.files) {
// //       if (req.files.photo) {
// //         payload.photo = req.files.photo[0].path.replace(/\\/g, "/");
// //         payload.photoUrl = payload.photo; // Keep both synced
// //       }
// //       if (req.files.resume) {
// //         payload.resume = req.files.resume[0].path.replace(/\\/g, "/");
// //         payload.resumeLink = payload.resume; // Keep both synced
// //       }
// //     }

// //     const member = await Member.create(payload);

// //     await Activity.create({
// //       type: "MEMBER",
// //       action: "created",
// //       meta: { name: member.name },
// //       targetId: member._id,
// //     });

// //     res.status(201).json(member);
// //   } catch (error) {
// //     console.error("Error adding member:", error);
// //     res.status(500).json({ message: "Server error adding member" });
// //   }
// // };

// // /* ---------------------------------------
// //    Update Member
// // ---------------------------------------- */
// // const updateMember = async (req, res) => {
// //   try {
// //     // 1. Get clean data (Now includes Cloudinary URLs from req.body)
// //     const payload = cleanPayload(req.body);

// //     // 2. Handle Cloudinary URLs (Backward Compatibility)
// //     if (payload.photo) payload.photoUrl = payload.photo;
// //     if (payload.resume) payload.resumeLink = payload.resume;

// //     // 3. Handle File Uploads (Fallback - merge if files exist)
// //     if (req.files) {
// //       if (req.files.photo) {
// //         payload.photo = req.files.photo[0].path.replace(/\\/g, "/");
// //         payload.photoUrl = payload.photo;
// //       }
// //       if (req.files.resume) {
// //         payload.resume = req.files.resume[0].path.replace(/\\/g, "/");
// //         payload.resumeLink = payload.resume;
// //       }
// //     }

// //     // 4. Update the Database
// //     const updatedMember = await Member.findByIdAndUpdate(
// //       req.params.id,
// //       { $set: payload },
// //       { new: true, runValidators: true }
// //     );

// //     if (!updatedMember) {
// //       return res.status(404).json({ message: "Member not found" });
// //     }

// //     res.status(200).json(updatedMember);
// //   } catch (error) {
// //     console.error("Error updating member:", error);
// //     res.status(500).json({ message: "Server error updating member" });
// //   }
// // };

// // /* ---------------------------------------
// //    Delete Member
// // ---------------------------------------- */
// // const deleteMember = async (req, res) => {
// //   try {
// //     const deleted = await Member.findByIdAndDelete(req.params.id);
// //     if (!deleted) {
// //       return res.status(404).json({ message: "Member not found" });
// //     }
// //     res.status(200).json({ message: "Member deleted successfully" });
// //   } catch (error) {
// //     res.status(400).json({ message: "Invalid member ID", error });
// //   }
// // };

// // /* ---------------------------------------
// //    Google Sheet Sync (kept separate)
// // ---------------------------------------- */
// // const syncMemberFromSheet = async (req, res) => {
// //   try {
// //     const secret = req.headers["x-webhook-secret"];
// //     if (secret !== process.env.WEBHOOK_SECRET) {
// //       return res.status(403).json({ message: "Unauthorized request" });
// //     }

// //     const identifier = { memberReferenceNumber: req.body.memberReferenceNumber };
// //     const payload = cleanPayload(req.body);

// //     const member = await Member.findOneAndUpdate(
// //       identifier,
// //       payload,
// //       { new: true, upsert: true }
// //     );

// //     res.json({ message: "Member synced successfully", member });
// //   } catch (err) {
// //     console.error("Sync Error:", err);
// //     res.status(500).json({ error: err.message });
// //   }
// // };

// // /* ---------------------------------------
// //    Utility: remove undefined values
// // ---------------------------------------- */
// // function cleanPayload(data) {
// //   const allowedFields = [
// //     // Common
// //     "name", "fathersName", "mobileNumber", "email", "gender",
// //     "dateOfBirth", "memberType", "currentInstitutionOrCompany",
// //     "district", "address", 

// //     // ✅ ADDED THESE to allow Cloudinary Links
// //     "photo", 
// //     "resume",

// //     // Legacy fields (Keep them for now)
// //     "photoUrl", 
// //     "resumeLink",
// //     "forGrouping",

// //     // Mentor
// //     "designation", 

// //     // Job Seeker
// //     "seekerNeed", "highest_education", "highestEducationSpecialization",
// //     "highestEducationPassedOutYear", "fieldofStudy_Interest",
// //     "preferredJobRole_Sector", "workExp", "relocationStatus",
// //     "preferredJobLocation", 

// //     // Opportunity Provider
// //     "jobOfferType", "offeringSector", "opportunityDescription",
// //     "offer_Location", "contactForSeekers",

// //     // Referee
// //     "referrerStatus", "referringOfferType", "referringSector",
// //     "referringFor", "levelOfSupport", "referrerContact",

// //     // Upskilling
// //     "interest_SkillBuildingProgram", "skillsToImprove",

// //     // System
// //     "memberReferenceNumber", "symMemberStatus",
// //   ];

// //   const payload = {};
// //   allowedFields.forEach((key) => {
// //     // We check for undefined explicitly so we don't overwrite with nulls unless intended
// //     if (data[key] !== undefined) {
// //       payload[key] = data[key];
// //     }
// //   });

// //   return payload;
// // }

// // module.exports = {
// //   getAllMembers,
// //   getMemberById,
// //   addMember,
// //   updateMember,
// //   deleteMember,
// //   syncMemberFromSheet,
// // };

// //--------------------19/1----------11.54------------------

// const Member = require("../models/member");
// const Activity = require("../models/activity");

// /* ---------------------------------------
//    Get all members
// ---------------------------------------- */
// const getAllMembers = async (req, res) => {
//   try {
//     const members = await Member.find().sort({ createdAt: -1 });
//     res.status(200).json(members);
//   } catch (error) {
//     console.error("Error fetching members:", error);
//     res.status(500).json({ message: "Server error fetching members" });
//   }
// };

// /* ---------------------------------------
//    Get member by ID
// ---------------------------------------- */
// const getMemberById = async (req, res) => {
//   try {
//     const member = await Member.findById(req.params.id);
//     if (!member) {
//       return res.status(404).json({ message: "Member not found" });
//     }
//     res.status(200).json(member);
//   } catch (error) {
//     console.error("Error fetching member:", error);
//     res.status(500).json({ message: "Server error fetching member" });
//   }
// };

// /* ---------------------------------------
//    Add Member
// ---------------------------------------- */
// const addMember = async (req, res) => {
//   try {
//     const payload = cleanPayload(req.body);

//     // Sync Cloudinary/Local upload paths
//     if (payload.photo) payload.photoUrl = payload.photo;
//     if (payload.resume) payload.resumeLink = payload.resume;

//     if (req.files) {
//       if (req.files.photo) {
//         payload.photoUrl = req.files.photo[0].path.replace(/\\/g, "/");
//       }
//       if (req.files.resume) {
//         payload.resumeLink = req.files.resume[0].path.replace(/\\/g, "/");
//       }
//     }

//     const member = await Member.create(payload);

//     await Activity.create({
//       type: "MEMBER",
//       action: "created",
//       meta: { name: member.name },
//       targetId: member._id,
//     });

//     res.status(201).json(member);
//   } catch (error) {
//     console.error("Error adding member:", error);
//     res.status(500).json({ message: "Server error adding member" });
//   }
// };

// /* ---------------------------------------
//    Update Member
// ---------------------------------------- */
// const updateMember = async (req, res) => {
//   try {
//     const payload = cleanPayload(req.body);

//     if (payload.photo) payload.photoUrl = payload.photo;
//     if (payload.resume) payload.resumeLink = payload.resume;

//     if (req.files) {
//       if (req.files.photo) {
//         payload.photoUrl = req.files.photo[0].path.replace(/\\/g, "/");
//       }
//       if (req.files.resume) {
//         payload.resumeLink = req.files.resume[0].path.replace(/\\/g, "/");
//       }
//     }

//     const updatedMember = await Member.findByIdAndUpdate(
//       req.params.id,
//       { $set: payload },
//       { new: true, runValidators: true }
//     );

//     if (!updatedMember) {
//       return res.status(404).json({ message: "Member not found" });
//     }

//     res.status(200).json(updatedMember);
//   } catch (error) {
//     console.error("Error updating member:", error);
//     res.status(500).json({ message: "Server error updating member" });
//   }
// };

// /* ---------------------------------------
//    Delete Member
// ---------------------------------------- */
// const deleteMember = async (req, res) => {
//   try {
//     const deleted = await Member.findByIdAndDelete(req.params.id);
//     if (!deleted) {
//       return res.status(404).json({ message: "Member not found" });
//     }
//     res.status(200).json({ message: "Member deleted successfully" });
//   } catch (error) {
//     res.status(400).json({ message: "Invalid member ID", error });
//   }
// };

// /* ---------------------------------------
//    Google Sheet Sync
// ---------------------------------------- */
// const syncMemberFromSheet = async (req, res) => {
//   try {
//     const secret = req.headers["x-webhook-secret"];
//     if (secret !== process.env.WEBHOOK_SECRET) {
//       return res.status(403).json({ message: "Unauthorized request" });
//     }

//     const identifier = { memberReferenceNumber: req.body.memberReferenceNumber };
//     const payload = cleanPayload(req.body);

//     const member = await Member.findOneAndUpdate(
//       identifier,
//       payload,
//       { new: true, upsert: true }
//     );

//     res.json({ message: "Member synced successfully", member });
//   } catch (err) {
//     console.error("Sync Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// };

// /* ---------------------------------------
//    Utility: remove undefined values
// ---------------------------------------- */
// function cleanPayload(data) {
//   const allowedFields = [
//     "name", "fathersName", "mobileNumber", "email", "gender",
//     "dateOfBirth", "memberType", "currentInstitutionOrCompany",
//     "district", "address", "photo", "resume", "photoUrl", "resumeLink",
//     "forGrouping", "nativePlace", "profession", "age",

//     // ✅ Added for Occupation & Company Details
//     "occupation",
//     "companyDetails",

//     // Mentor
//     "designation",

//     // Job Seeker
//     "seekerNeed", "highest_education","branch", "highestEducationSpecialization",
//     "highestEducationPassedOutYear", "fieldofStudy_Interest",
//     "preferredJobRole_Sector", "workExp", "relocationStatus",
//     "preferredJobLocation",

//     // Opportunity Provider
//     "jobOfferType", "offeringSector", "opportunityDescription",
//     "offer_Location", "contactForSeekers",

//     // Referee
//     "referrerStatus", "referringOfferType", "referringSector",
//     "referringFor", "levelOfSupport", "referrerContact",

//     // Upskilling
//     "interest_SkillBuildingProgram", "skillsToImprove",

//     // System
//     "memberReferenceNumber", "symMemberStatus",

//     // ✅ ADDED: Naukri-style fields
//     "careerProfile", "certifications", "languages",
//     "fatherName", "motherName", "hometown", "pincode",
//     "passportNumber", "maritalStatus"
//   ];


//   const payload = {};
//   allowedFields.forEach((key) => {
//     if (data[key] !== undefined) {
//       payload[key] = data[key];
//     }
//   });

//   return payload;
// }

// // Ensure all these are defined above before exporting
// module.exports = {
//   getAllMembers,
//   getMemberById,
//   addMember,
//   updateMember,
//   deleteMember,
//   syncMemberFromSheet,
// };

const Member = require("../models/member");   // ✅ IMPORTANT for Linux/Vercel case-sensitive
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

    // ✅ NEW: passOutYear (frontend)
    "passOutYear",

    // Existing older fields (keep)
    "highestEducationSpecialization",
    "highestEducationPassedOutYear",

    "fieldofStudy_Interest",
    "preferredJobRole_Sector",
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
    "certifications",
    "languages",
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
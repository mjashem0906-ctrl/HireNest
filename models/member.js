const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    memberReferenceNumber: String,
    timestamp: String,
    name: String,
    dateOfBirth: String,
    age: String,
    gender: String,
    mobileNumber: String,
    email: String,
    googleId: String,
    district: String,
    address: String,
    symMemberStatus: String,
    memberType: String,
    photoUrl: String,

    // Professional details
    occupation: String,
    companyDetails: String,
    currentInstitutionOrCompany: String,
    designation: String,

    // --- NEW: Professional Details (Naukri Style) ---
    careerProfile: {
      location: String,
      role: [String],
      industry: String,
      department: String,
      employmentType: String,
      expectedSalary: String,
      noticePeriod: String,
    },

    experienceDetails: [{
      companyName: String,
      designation: String,
      startDate: String,
      endDate: String,
      currentlyWorking: Boolean,
      description: String,
    }],

    /**
     * ✅ UPDATED Certifications
     * - Supports NEW UI fields: name, description, certifiedDate
     * - Also keeps OLD fields: title, organization, year, link (backward compatible)
     */
    certifications: [
      {
        // NEW
        name: String,
        description: String,
        certifiedDate: String, // free text / YYYY-MM-DD

        // OLD (keep for existing DB data)
        title: String,
        organization: String,
        year: String,
        link: String,
      },
    ],

    languages: [String],
    
    // ✅ NEW: Added skills array so MongoDB actually saves it!
    skills: [String],

    // Job Seeker specific
    seekerNeed: [String],
    highest_education: String,
    branch: String,
    educationStatus: String,

    // ✅ NEW: Pass-out Year (your frontend uses passOutYear)
    passOutYear: String,

    // Existing older fields (keep)
    highestEducationSpecialization: String,
    highestEducationPassedOutYear: String,

    fieldofStudy_Interest: String,
    preferredJobRole_Sector: { type: [String], default: [] },
    employmentType: String,
    noticePeriod: String,
    workExp: String,
    relocationStatus: String,
    preferredJobLocation: String,
    resumeLink: String,
    declaration_Seeker: String,

    // Opportunity Provider specific
    jobOfferType: [String],
    offeringSector: [String],
    opportunityDescription: String,
    offer_Location: String,
    contactForSeekers: String,
    declaration_Recruiter: String,

    // Referee specific fields
    referrerStatus: String,
    referringOfferType: [String],
    referringSector: [String],
    referringFor: String,
    levelOfSupport: [String],
    referrerContact: String,
    declaration_Referee: String,

    // Upskiller specific
    interest_SkillBuildingProgram: String,
    skillsToImprove: [String],
    declaration_Upskiller: String,

    // Additional Personal Details (Naukri Style)
    fatherName: String,
    motherName: String,
    hometown: String,
    pincode: String,
    passportNumber: String,
    maritalStatus: String,

    submittingEmail: String,
    linkedinUrl: String,
  },
  { timestamps: true }
);

memberSchema.pre("save", async function (next) {
  // Sync employmentType
  if (this.isModified("careerProfile.employmentType")) {
    this.employmentType = this.careerProfile.employmentType;
  } else if (this.isModified("employmentType")) {
    if (!this.careerProfile) this.careerProfile = {};
    this.careerProfile.employmentType = this.employmentType;
  } else {
    if (this.employmentType && (!this.careerProfile || !this.careerProfile.employmentType)) {
      if (!this.careerProfile) this.careerProfile = {};
      this.careerProfile.employmentType = this.employmentType;
    } else if (this.careerProfile?.employmentType && !this.employmentType) {
      this.employmentType = this.careerProfile.employmentType;
    }
  }

  // Sync noticePeriod
  if (this.isModified("careerProfile.noticePeriod")) {
    this.noticePeriod = this.careerProfile.noticePeriod;
  } else if (this.isModified("noticePeriod")) {
    if (!this.careerProfile) this.careerProfile = {};
    this.careerProfile.noticePeriod = this.noticePeriod;
  } else {
    if (this.noticePeriod && (!this.careerProfile || !this.careerProfile.noticePeriod)) {
      if (!this.careerProfile) this.careerProfile = {};
      this.careerProfile.noticePeriod = this.noticePeriod;
    } else if (this.careerProfile?.noticePeriod && !this.noticePeriod) {
      this.noticePeriod = this.careerProfile.noticePeriod;
    }
  }

  // Sync preferredJobRole_Sector <-> careerProfile.role (both are arrays)
  const toArr = (v) => {
    if (Array.isArray(v)) return v.flat(Infinity).map((item) => String(item || "").trim()).filter(Boolean);
    if (v && typeof v === "string" && v.trim()) return [v.trim()];
    return [];
  };

  if (this.isModified("careerProfile.role")) {
    this.preferredJobRole_Sector = toArr(this.careerProfile.role);
  } else if (this.isModified("preferredJobRole_Sector")) {
    if (!this.careerProfile) this.careerProfile = {};
    this.careerProfile.role = toArr(this.preferredJobRole_Sector);
  } else {
    const pref = toArr(this.preferredJobRole_Sector);
    const role = toArr(this.careerProfile?.role);
    if (pref.length > 0 && role.length === 0) {
      if (!this.careerProfile) this.careerProfile = {};
      this.careerProfile.role = pref;
    } else if (role.length > 0 && pref.length === 0) {
      this.preferredJobRole_Sector = role;
    }
  }

  // ✅ Auto-generate sequential memberReferenceNumber across Members & Recruiters if not set
  if (!this.memberReferenceNumber) {
    try {
      const MemberModel = mongoose.models.Member || mongoose.model("Member");
      const RecruiterModel = mongoose.models.Recruiter || require("./Recruiter");
      
      const allMembers = await MemberModel.find().select('memberReferenceNumber').lean();
      const allRecruiters = await RecruiterModel.find().select('memberReferenceNumber').lean();
      
      let maxRefNo = 0;
      for (const m of [...allMembers, ...allRecruiters]) {
        if (m.memberReferenceNumber) {
          const parsed = parseInt(m.memberReferenceNumber, 10);
          if (!isNaN(parsed) && parsed > maxRefNo) {
            maxRefNo = parsed;
          }
        }
      }
      this.memberReferenceNumber = (maxRefNo + 1).toString();
    } catch (err) {
      return next(err);
    }
  }

  next();
});

module.exports = mongoose.model("Member", memberSchema);
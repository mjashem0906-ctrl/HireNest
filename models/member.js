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
      role: String,
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

    // ✅ NEW: Pass-out Year (your frontend uses passOutYear)
    passOutYear: String,

    // Existing older fields (keep)
    highestEducationSpecialization: String,
    highestEducationPassedOutYear: String,

    fieldofStudy_Interest: String,
    preferredJobRole_Sector: String,
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

memberSchema.pre("save", function (next) {
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

  next();
});

module.exports = mongoose.model("Member", memberSchema);
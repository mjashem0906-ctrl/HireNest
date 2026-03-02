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
      expectedSalary: String
    },
    certifications: [{
      title: String,
      organization: String,
      year: String,
      link: String
    }],
    languages: [String],

    // Job Seeker specific
    seekerNeed: [String],
    highest_education: String,
    branch: String,
    highestEducationSpecialization: String,
    highestEducationPassedOutYear: String,
    fieldofStudy_Interest: String,
    preferredJobRole_Sector: String,
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
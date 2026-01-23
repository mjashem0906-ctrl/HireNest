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

    // ✅ ADDED: Professional details for Referees/Others
    occupation: String, 
    companyDetails: String,

    // Shared Professional Info
    currentInstitutionOrCompany: String,
    designation: String, 
    
    // Job Seeker
    seekerNeed: [String],
    highest_education: String,
    highestEducationSpecialization: String,
    highestEducationPassedOutYear: String,
    fieldofStudy_Interest: String,
    preferredJobRole_Sector: String,
    workExp: String,
    relocationStatus: String,
    preferredJobLocation: String, 
    resumeLink: String,
    declaration_Seeker: String,
    
    // Opportunity Provider
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

    // Upskiller
    interest_SkillBuildingProgram: String,
    skillsToImprove: [String],
    declaration_Upskiller: String,
    
    submittingEmail: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
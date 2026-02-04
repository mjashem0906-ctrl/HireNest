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

<<<<<<< HEAD
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
=======
    // ✅ ADDED: Professional details for Referees/Others
    occupation: String, 
    companyDetails: String,

    // Shared Professional Info
    currentInstitutionOrCompany: String,
    designation: String, 
    
    // Job Seeker
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8
    seekerNeed: [String],
    highest_education: String,
    highestEducationSpecialization: String,
    highestEducationPassedOutYear: String,
    fieldofStudy_Interest: String,
    preferredJobRole_Sector: String,
    workExp: String,
    relocationStatus: String,
<<<<<<< HEAD
    preferredJobLocation: String,
    resumeLink: String,
    declaration_Seeker: String,

    // Opportunity Provider specific
=======
    preferredJobLocation: String, 
    resumeLink: String,
    declaration_Seeker: String,
    
    // Opportunity Provider
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8
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

<<<<<<< HEAD
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

=======
    // Upskiller
    interest_SkillBuildingProgram: String,
    skillsToImprove: [String],
    declaration_Upskiller: String,
    
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8
    submittingEmail: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    memberReferenceNumber: String,  // Column A
    timestamp: String,              // Column B
    name: String,                   // Column C
    dateOfBirth: String,            // ✅ Added (Required for Age calculation)
    age: String,                    // Column D (Optional, since we have DOB)
    gender: String,                 // Column E
    mobileNumber: String,           // Column F
    email: String,                  // Column G
    district: String,               // Column H (Address)
    address: String,                // ✅ Added (Full Address)
    symMemberStatus: String,        // Column I
    memberType: String,             // Column J
    photoUrl: String,               // ✅ Added (Profile Photo)

    // ✅ SHARED PROFESSIONAL INFO (Mentors & Job Seekers)
    currentInstitutionOrCompany: String, // Company / Institution
    designation: String,                 // Job Role / Designation (Mentor)
    
    // Job Seeker
    seekerNeed: [String],           // Column K
    highest_education: String,      // Column L
    highestEducationSpecialization: String, // ✅ Added (Specialization of Highest Education)
    highestEducationPassedOutYear: String, // ✅ Added (Year of Passing Highest Education)
    fieldofStudy_Interest: String,  // Column M (Shared with Mentor as Expertise)
    preferredJobRole_Sector: String,// Column N
    workExp: String,                // Column O (Shared with Mentor as Experience)
    relocationStatus: String,       // Column P
    preferredJobLocation: String,   // Column Q 
    resumeLink: String,             // Column R
    declaration_Seeker: String,     // Column S
    
    // Opportunity Provider
    jobOfferType: [String],         // Column T
    offeringSector: [String],       // Column U
    opportunityDescription: String, // Column V
    offer_Location: String,         // Column W
    contactForSeekers: String,      // Column X
    declaration_Recruiter: String,  // Column Y

    // Referee
    referrerStatus: String,         // Column Z
    referringOfferType: [String],   // Column AA
    referringSector: [String],      // Column AB
    referringFor: String,           // Column AC
    levelOfSupport: [String],       // Column AD
    referrerContact: String,        // Column AE
    declaration_Referee: String,    // Column AF

    // Upskiller
    interest_SkillBuildingProgram: String, // Column AG
    skillsToImprove: [String],             // Column AH
    declaration_Upskiller: String,         // Column AI
    
    submittingEmail: String,        // Form Submitting email auto recorded
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);
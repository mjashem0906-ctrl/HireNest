const mongoose = require("mongoose");
const memberSchema = new mongoose.Schema(
  {
    memberReferenceNumber: String,  // Column A
    timestamp: String,              // Column B
    name: String,                   // Column C
    age:String,                     // Column D
    gender: String,                 // Column E
    mobileNumber: String,           // Column F
    email:String,                   // Column G
    district: String,               // Column H
    symMemberStatus: String,        // Column I
    memberType: String,             // Column J

    //job seeker
    seekerNeed: [String],           // Column K
    highest_education: String,      // Column L
    fieldofStudy_Interest: String,  // Column M
    preferredJobRole_Sector: String,// Column N
    workExp: String,                // Column O
    relocationStatus: String,       // Column P
    preferredJobLocation: String,   // Column Q 
    resumeLink: String,             // Column R
    declaration_Seeker: String,     // Column S
    
    //opportunity provider
    jobOfferType: [String],         // Column T
    offeringSector: [String],       // Column U
    opportunityDescription: String, // Column V
    offer_Location: String,         // Column W
    contactForSeekers: String,      // Column X
    declaration_Recruiter: String,  //Column Y

    //Referee
    referrerStatus: String,               // Column Z
    referringOfferType: [String],          // Column AA
    referringSector: [String],             // Column AB
    referringFor: String,                  // Column AC
    levelOfSupport: [String],              // Column AD
    referrerContact: String,               // Column AE
    declaration_Referee: String,           // Column AF

    //upskiller
    interest_SkillBuildingProgram: String,  // Column AG
    skillsToImprove: [String],              // Column AH
    declaration_Upskiller: String,          // Column AI
    submittingEmail: String,                // Form Submitting email auto recorded
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);

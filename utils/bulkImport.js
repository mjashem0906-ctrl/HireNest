const { google } = require("googleapis");
const auth = require("../config/googleAuth");
const Member = require("../models/member");
require("dotenv").config();
const SHEET_ID = process.env.GOOGLE_SHEET_ID_1;
const RANGE = process.env.GOOGLE_SHEET_RANGE; 
// const connectDB = require('../config/connectionDB');
// connectDB();

const bulkImport = async () => {
  try {
    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values;
    if (!rows.length) {
      console.log("⚠️ No data found in Google Sheet.");
      return;
    }

    const members = rows.map(row => {
      const [
    memberReferenceNumber,      // Column A
    timestamp,                  // Column B
    name,                       // Column C
    age,                        // Column D
    gender,                     // Column E
    mobileNumber,               // Column F
    email,                      // Column G
    district,                   // Column H
    symMemberStatus,            // Column I
    memberType,                 // Column J

    //job seeker
    seekerNeed,             // Column K
    highest_education,      // Column L
    fieldofStudy_Interest,  // Column M
    preferredJobRole_Sector,// Column N
    workExp,                // Column O
    relocationStatus,       // Column P
    preferredJobLocation,   // Column Q 
    resumeLink,             // Column R
    declaration_Seeker,     // Column S
    
    //opportunity provider
    jobOfferType,           // Column T
    offeringSector,         // Column U
    opportunityDescription, // Column V
    offer_Location,         // Column W
    contactForSeekers,      // Column X
    declaration_Recruiter,  //Column Y

    //Referee
    referrerStatus,               // Column Z
    referringOfferType,           // Column AA
    referringSector,              // Column AB
    referringFor,                 // Column AC
    levelOfSupport,               // Column AD
    referrerContact,              // Column AE
    declaration_Referee,          // Column AF

    //upskiller
    interest_SkillBuildingProgram,  // Column AG
    skillsToImprove,                // Column AH
    declaration_Upskiller,          // Column AI
    submittingEmail,                // Form Submitting email auto recorded
      ] = row;

      return {
    memberReferenceNumber,      // Column A
    timestamp,                  // Column B
    name,                       // Column C
    age,                        // Column D
    gender,                     // Column E
    mobileNumber,               // Column F
    email,                      // Column G
    district,                   // Column H
    symMemberStatus,            // Column I
    memberType,                 // Column J

    //job seeker
    seekerNeed,             // Column K
    highest_education,      // Column L
    fieldofStudy_Interest,  // Column M
    preferredJobRole_Sector,// Column N
    workExp,                // Column O
    relocationStatus,       // Column P
    preferredJobLocation,   // Column Q 
    resumeLink,             // Column R
    declaration_Seeker,     // Column S
    
    //opportunity provider
    jobOfferType,           // Column T
    offeringSector,         // Column U
    opportunityDescription, // Column V
    offer_Location,         // Column W
    contactForSeekers,      // Column X
    declaration_Recruiter,  //Column Y

    //Referee
    referrerStatus,               // Column Z
    referringOfferType,           // Column AA
    referringSector,              // Column AB
    referringFor,                 // Column AC
    levelOfSupport,               // Column AD
    referrerContact,              // Column AE
    declaration_Referee,          // Column AF

    //upskiller
    interest_SkillBuildingProgram,  // Column AG
    skillsToImprove,                // Column AH
    declaration_Upskiller,          // Column AI
    submittingEmail,                // Form Submitting email auto recorded
      };
    });

    await Member.deleteMany(); // Clears old data (optional)
    await Member.insertMany(members);

    console.log(`✅ Successfully imported ${members.length} members into MongoDB`);
  } catch (err) {
    console.error("❌ Bulk Import Error:", err);
  }
};

module.exports = bulkImport;

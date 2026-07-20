//------------------------------------------------28.01------------------------03.01-------------------

const mongoose = require('mongoose');

const recruiterSchema = mongoose.Schema({
  // 1. Personal & Professional
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  designation: { type: String, required: true }, // Job Title
  department: { type: String, required: true },
  employeeId: { type: String, default: "N/A" }, // New
  profilePicture: { type: String, default: "" }, // New (URL)

  // 2. Company & Scope Details
  companyName: { type: String, required: true }, // New
  companyGST: { type: String, required: true },
  companyEmail: { type: String, required: true },
  location: { type: String, required: true }, // New (City/Country)
  industries: { type: [String], required: true }, // New (Array of strings)
  roleTypes: { type: [String], default: [] }, // New (Tech, Non-tech etc)
  hiringVolume: { type: String, required: true }, // New
  teamSize: { type: String, required: true }, // New
  registeredVia: { type: String, enum: ['admin', 'shareable_link', 'form_link'], default: 'admin' }, // Tracks registration source
  memberReferenceNumber: { type: String, default: null }, // Shared reference number sequence with Members
  
  password: { type: String, required: true }
}, {
  timestamps: true
});

recruiterSchema.pre("save", async function (next) {
  if (!this.memberReferenceNumber) {
    try {
      const MemberModel = mongoose.models.Member || require("./member");
      const RecruiterModel = mongoose.models.Recruiter || mongoose.model("Recruiter");
      
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

module.exports = mongoose.model('Recruiter', recruiterSchema);
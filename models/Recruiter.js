const mongoose = require('mongoose');

const recruiterSchema = mongoose.Schema({
  // 1. Personal & Professional (Canonical)
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  designation: { type: String }, // Job Title
  department: { type: String },
  employeeId: { type: String, default: "N/A" },
  profilePicture: { type: String, default: "" },

  // 2. Company & Scope Details (Canonical)
  currentInstitutionOrCompany: { type: String },
  companyGST: { type: String, default: "" },
  companyEmail: { type: String },
  district: { type: String },
  industries: { type: [String], default: [] },
  roleTypes: { type: [String], default: [] },
  hiringVolume: { type: String },
  teamSize: { type: String },
  registeredVia: { type: String, enum: ['admin', 'shareable_link', 'form_link'], default: 'admin' },
  memberReferenceNumber: { type: String, default: null },
  symMemberStatus: { type: String },
  solidarityMember: { type: String },
  memberType: { type: String, default: "Recruiter" },
  username: { type: String },
  password: { type: String },
  plainPassword: { type: String },
  rawPassword: { type: String }
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
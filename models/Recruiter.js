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
  companyName: { type: String, default: "JobBridge Karnataka" }, // New
  location: { type: String, default: "Not Specified" }, // New (City/Country)
  industries: { type: [String], default: [] }, // New (Array of strings)
  roleTypes: { type: [String], default: [] }, // New (Tech, Non-tech etc)
  hiringVolume: { type: String, default: "N/A" }, // New
  teamSize: { type: String, default: "Individual Contributor" }, // New
  registeredVia: { type: String, enum: ['admin', 'shareable_link', 'form_link'], default: 'admin' }, // Tracks registration source
  
  password: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recruiter', recruiterSchema);
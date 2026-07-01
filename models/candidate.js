const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, "First name is required"],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, "Last name is required"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true
  },
  
  // Professional Information
  address: {
    type: String,
    trim: true
  },
  qualification: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  skills: {
    type: [String], // Array of skills
    default: []
  },
  
  // File upload
  resume: {
    filename: String,
    path: String,
    mimetype: String,
    size: Number
  },
  
  // Authentication
  authSource: {
    type: String,
    enum: ["google", "email", "manual"],
    default: "manual"
  },
  googleId: {
    type: String,
    sparse: true // Allows null values but enforces uniqueness for non-null values
  },
  
  // Status
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "active"],
    default: "pending"
  },
  
  // Timestamps
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
  
}, { timestamps: true });

module.exports = mongoose.model("Candidate", candidateSchema);
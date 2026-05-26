const Recruiter = require('../models/Recruiter');

// @desc    Register a new recruiter
// @route   POST /api/recruiters
const addRecruiter = async (req, res) => {
  try {
    // 1. Debugging: See exactly what the frontend sent
    console.log("📥 Received Data:", req.body);

    const { 
      fullName, email, phone, designation, department,
      employeeId, companyName, companyGST, companyEmail, location, industries, roleTypes, hiringVolume, teamSize, registeredVia
    } = req.body;

    // 2. VALIDATION: Check required fields.
    if (
      !fullName || !email || !phone || !designation || !department || 
      !companyName || !companyGST || !companyEmail || !location || !hiringVolume || !teamSize ||
      !industries || (Array.isArray(industries) && industries.length === 0)
    ) {
      console.log("❌ Validation Failed: Missing required fields");
      return res.status(400).json({ 
        message: "Please fill in all required fields (Name, Email, Phone, Designation, Dept, Company Name, Company GST, Company Email, Hiring Region, Monthly Hiring Volume, Team Size, Industries)" 
      });
    }

    const recruiterExists = await Recruiter.findOne({ email });
    if (recruiterExists) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    // 3. Create Recruiter
    const recruiter = await Recruiter.create({
      fullName,
      email,
      phone,
      designation,
      department,
      companyName,
      companyGST,
      companyEmail,
      location,
      industries,
      hiringVolume,
      teamSize,
      // Optional fields with defaults
      employeeId: employeeId || "N/A",
      roleTypes: roleTypes || [],
      registeredVia: registeredVia || "admin", // 'shareable_link' when from the form, 'admin' when modal
      password: "secretPassword123" 
    });

    if (recruiter) {
      console.log("✅ Recruiter Created:", recruiter._id);
      res.status(201).json({
        _id: recruiter.id,
        fullName: recruiter.fullName,
        email: recruiter.email,
        message: "Recruiter added successfully!"
      });
    } else {
      res.status(400).json({ message: "Invalid recruiter data" });
    }

  } catch (error) {
    console.error("Error adding recruiter:", error); 
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all recruiters
// @route   GET /api/recruiters
const getRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find({}).sort({ createdAt: -1 });
    res.json(recruiters);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get single recruiter
// @route   GET /api/recruiters/:id
const getRecruiterById = async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id);
    if (recruiter) {
      res.json(recruiter);
    } else {
      res.status(404).json({ message: 'Recruiter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update recruiter details
// @route   PUT /api/recruiters/:id
const updateRecruiter = async (req, res) => {
  try {
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );
    if (updatedRecruiter) {
      res.json(updatedRecruiter);
    } else {
      res.status(404).json({ message: 'Recruiter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: "Error updating recruiter" });
  }
};

// @desc    Delete a recruiter
// @route   DELETE /api/recruiters/:id
const deleteRecruiter = async (req, res) => {
  try {
    const deleted = await Recruiter.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.json({ message: "Recruiter removed" });
    } else {
      res.status(404).json({ message: 'Recruiter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: "Error deleting recruiter" });
  }
};

// EXPORT ALL FUNCTIONS
module.exports = { 
  addRecruiter, 
  getRecruiters, 
  getRecruiterById, 
  updateRecruiter, 
  deleteRecruiter 
};
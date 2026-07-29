const Referee = require('../models/Referee');
const Member = require('../models/member');
const Service = require('../models/service');
const mongoose = require('mongoose');

// Helper to format Member doc as Referee object for frontend
const formatRefereeFromMember = (m) => ({
  _id: m._id,
  name: m.name || '',
  email: m.email || '',
  phoneNumber: m.mobileNumber || m.phoneNumber || '',
  relationship: m.relationship || '',
  gender: m.gender || '',
  occupation: m.occupation || '',
  companyDetails: m.companyDetails || m.currentInstitutionOrCompany || '',
  referrerStatus: m.referrerStatus || 'Interested in joining',
  referringOfferType: m.referringOfferType || '',
  referringSector: m.referringSector || '',
  referringFor: m.referringFor || '',
  levelOfSupport: m.levelOfSupport || '',
  memberType: m.memberType || 'Referee',
  district: m.district || '',
  age: m.age || '',
  photoUrl: m.photoUrl || '',
  memberReferenceNumber: m.memberReferenceNumber || null,
  referrerContact: m.referrerContact || '',
  declaration_Referee: m.declaration_Referee || false,
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
});

// Function to add a new referee
const addReferee = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      relationship,
      gender,
      occupation,
      companyDetails,
      referrerStatus,
      referringOfferType,
      referringSector,
      referringFor,
      levelOfSupport,
      memberType = "Referee",
      district,
      age,
      photoUrl,
      memberReferenceNumber,
      referrerContact,
      declaration_Referee
    } = req.body;

    const cleanEmail = String(email).trim().toLowerCase();
    const existingMember = await Member.findOne({ email: cleanEmail });
    if (existingMember) {
      return res.status(400).json({ message: "Referee with this email already exists" });
    }

    // 1. Save to Members collection (Primary storage)
    const newMemberReferee = await Member.create({
      name,
      email: cleanEmail,
      mobileNumber: phoneNumber,
      memberType: 'Referee',
      gender,
      occupation,
      companyDetails,
      currentInstitutionOrCompany: companyDetails,
      referrerStatus,
      referringOfferType,
      referringSector,
      referringFor,
      levelOfSupport,
      district,
      age,
      photoUrl,
      memberReferenceNumber,
      referrerContact,
      declaration_Referee,
      symMemberStatus: 'Active',
    });

    // 2. Also save to legacy Referee model
    let newReferee = null;
    try {
      newReferee = new Referee({
        name,
        email: cleanEmail,
        phoneNumber,
        relationship,
        gender,
        occupation,
        companyDetails,
        referrerStatus,
        referringOfferType,
        referringSector,
        referringFor,
        levelOfSupport,
        memberType,
        district,
        age,
        photoUrl,
        memberReferenceNumber,
        referrerContact,
        declaration_Referee
      });
      await newReferee.save();
    } catch (e) {
      console.warn("Notice: Saved to Members collection. Referee legacy doc error:", e.message);
    }

    res.status(201).json({ 
      message: "Referee added successfully!", 
      referee: formatRefereeFromMember(newMemberReferee)
    });
    
  } catch (error) {
    console.error("Error adding referee:", error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: "Referee with this email already exists" 
      });
    }
    res.status(500).json({ 
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all referees from Members collection
const getAllReferees = async (req, res) => {
  try {
    const memberReferees = await Member.find({
      memberType: { $regex: /referee/i }
    }).sort({ createdAt: -1 });

    const memberEmails = new Set(memberReferees.map(m => m.email?.toLowerCase()));

    const legacyReferees = await Referee.find().sort({ createdAt: -1 });
    const additionalReferees = legacyReferees.filter(r => !memberEmails.has(r.email?.toLowerCase()));

    const combined = [
      ...memberReferees.map(formatRefereeFromMember),
      ...additionalReferees
    ];

    res.status(200).json({
      success: true,
      count: combined.length,
      data: combined
    });
  } catch (error) {
    console.error("Error fetching referees:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get single referee by ID from Members collection
const getRefereeById = async (req, res) => {
  try {
    const memberDoc = await Member.findById(req.params.id);
    if (memberDoc) {
      return res.status(200).json({
        success: true,
        data: formatRefereeFromMember(memberDoc)
      });
    }
    const legacyDoc = await Referee.findById(req.params.id);
    if (legacyDoc) {
      return res.status(200).json({
        success: true,
        data: legacyDoc
      });
    }
    return res.status(404).json({ 
      success: false,
      message: "Referee not found" 
    });
  } catch (error) {
    console.error("Error fetching referee:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update referee in Members collection
const updateReferee = async (req, res) => {
  try {
    const updates = req.body;
    updates.updatedAt = Date.now();

    const memberUpdates = {
      name: updates.name,
      email: updates.email,
      mobileNumber: updates.phoneNumber || updates.mobileNumber,
      gender: updates.gender,
      occupation: updates.occupation,
      companyDetails: updates.companyDetails,
      currentInstitutionOrCompany: updates.companyDetails,
      referrerStatus: updates.referrerStatus,
      referringOfferType: updates.referringOfferType,
      referringSector: updates.referringSector,
      referringFor: updates.referringFor,
      levelOfSupport: updates.levelOfSupport,
      district: updates.district,
      age: updates.age,
      photoUrl: updates.photoUrl,
      referrerContact: updates.referrerContact,
      declaration_Referee: updates.declaration_Referee,
    };
    Object.keys(memberUpdates).forEach(k => memberUpdates[k] === undefined && delete memberUpdates[k]);

    let updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: memberUpdates },
      { new: true }
    );

    try {
      await Referee.findByIdAndUpdate(req.params.id, updates, { new: true });
    } catch (e) {}

    if (updatedMember) {
      return res.status(200).json({
        success: true,
        message: "Referee updated successfully",
        data: formatRefereeFromMember(updatedMember)
      });
    }

    const legacyUpdated = await Referee.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (legacyUpdated) {
      return res.status(200).json({
        success: true,
        message: "Referee updated successfully",
        data: legacyUpdated
      });
    }
    
    return res.status(404).json({ 
      success: false,
      message: "Referee not found" 
    });
  } catch (error) {
    console.error("Error updating referee:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete referee from Members collection
const deleteReferee = async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    try {
      await Referee.findByIdAndDelete(req.params.id);
    } catch (e) {}
    
    if (deletedMember) {
      return res.status(200).json({
        success: true,
        message: "Referee deleted successfully from Members collection"
      });
    }
    return res.status(404).json({ 
      success: false,
      message: "Referee not found" 
    });
  } catch (error) {
    console.error("Error deleting referee:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Search referees with filters in Members collection
const searchReferees = async (req, res) => {
  try {
    const { 
      search, 
      occupation, 
      company, 
      status,
      page = 1,
      limit = 50 
    } = req.query;
    
    let query = {
      memberType: { $regex: /referee/i }
    };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { occupation: { $regex: search, $options: 'i' } },
        { companyDetails: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (occupation) {
      query.occupation = { $regex: occupation, $options: 'i' };
    }
    
    if (company) {
      query.companyDetails = { $regex: company, $options: 'i' };
    }
    
    if (status) {
      query.referrerStatus = status;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const memberReferees = await Member.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Member.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: memberReferees.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: memberReferees.map(formatRefereeFromMember)
    });
    
  } catch (error) {
    console.error("Error searching referees:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all jobs/services referred by a specific referee
const getRefereeReferredJobs = async (req, res) => {
  try {
    const { refereeId } = req.params;
    
    console.log("=== getRefereeReferredJobs ===");
    console.log("Referee ID received:", refereeId);
    
    if (!refereeId) {
      return res.status(400).json({
        success: false,
        message: "Referee ID is required"
      });
    }
    
    // Convert string ID to ObjectId for mongo query
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(refereeId);
    } catch (e) {
      console.error("Invalid ObjectId format:", refereeId);
      objectId = refereeId; // Fallback to string
    }
    
    // Fetch all services where this referee is the referredBy
    // The refereeId is a Member ID, not a Referee model ID
    const referredJobs = await Service.find({ refereedBy: objectId })
      .populate('refereedBy', 'name email occupation')
      .populate('memberId', 'name email')
      .populate('jobPosted', 'fullName email')
      .sort({ createdAt: -1 });
    
    console.log("Found jobs:", referredJobs.length);
    console.log("Query used - refereedBy:", objectId);
    
    res.status(200).json({
      success: true,
      count: referredJobs.length,
      data: referredJobs
    });
  } catch (error) {
    console.error("Error fetching referred jobs:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// Export all functions
module.exports = { 
  addReferee,
  getAllReferees,
  getRefereeById,
  updateReferee,
  deleteReferee,
  searchReferees,
  getRefereeReferredJobs
};
<<<<<<< HEAD
=======
// // controllers/refereeController.js
// const Referee = require('../models/Referee');

// // Function to add a new referee
// const addReferee = async (req, res) => {
//   try {
//     const { name, email, phoneNumber, relationship } = req.body;

//     // 1. Check if referee already exists (optional)
//     const existingReferee = await Referee.findOne({ email });
//     if (existingReferee) {
//       return res.status(400).json({ message: "Referee with this email already exists" });
//     }

//     // 2. Create new referee instance
//     const newReferee = new Referee({
//       name,
//       email,
//       phoneNumber,
//       relationship
//     });

//     // 3. Save to database
//     await newReferee.save();

//     res.status(201).json({ message: "Referee added successfully!", referee: newReferee });
//   } catch (error) {
//     console.error("Error adding referee:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// module.exports = { addReferee };

// controllers/refereeController.js
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8
const Referee = require('../models/Referee');

// Function to add a new referee
const addReferee = async (req, res) => {
  try {
    const {
      // Existing fields
      name,
      email,
      phoneNumber,
      relationship,
      
      // New fields from your frontend
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

    // 1. Check if referee already exists (optional)
    const existingReferee = await Referee.findOne({ email });
    if (existingReferee) {
      return res.status(400).json({ message: "Referee with this email already exists" });
    }

    // 2. Create new referee instance with all fields
    const newReferee = new Referee({
      // Existing fields
      name,
      email,
      phoneNumber,
      relationship,
      
      // New fields
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

    // 3. Save to database
    await newReferee.save();

    res.status(201).json({ 
      message: "Referee added successfully!", 
      referee: newReferee 
    });
    
  } catch (error) {
    console.error("Error adding referee:", error);
    
    // Handle duplicate key error (for unique email)
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

// Get all referees
const getAllReferees = async (req, res) => {
  try {
    const referees = await Referee.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: referees.length,
      data: referees
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

// Get single referee by ID
const getRefereeById = async (req, res) => {
  try {
    const referee = await Referee.findById(req.params.id);
    
    if (!referee) {
      return res.status(404).json({ 
        success: false,
        message: "Referee not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: referee
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

// Update referee
const updateReferee = async (req, res) => {
  try {
    const updates = req.body;
    
    // Add updatedAt timestamp
    updates.updatedAt = Date.now();
    
    const referee = await Referee.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!referee) {
      return res.status(404).json({ 
        success: false,
        message: "Referee not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Referee updated successfully",
      data: referee
    });
  } catch (error) {
    console.error("Error updating referee:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete referee
const deleteReferee = async (req, res) => {
  try {
    const referee = await Referee.findByIdAndDelete(req.params.id);
    
    if (!referee) {
      return res.status(404).json({ 
        success: false,
        message: "Referee not found" 
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Referee deleted successfully"
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

// Search referees with filters
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
    
    let query = {};
    
    // Search across multiple fields
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { district: { $regex: search, $options: 'i' } },
        { occupation: { $regex: search, $options: 'i' } },
        { companyDetails: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by occupation
    if (occupation) {
      query.occupation = { $regex: occupation, $options: 'i' };
    }
    
    // Filter by company
    if (company) {
      query.companyDetails = { $regex: company, $options: 'i' };
    }
    
    // Filter by status
    if (status) {
      query.referrerStatus = status;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const referees = await Referee.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const total = await Referee.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: referees.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: referees
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

// Export all functions
module.exports = { 
  addReferee,
  getAllReferees,
  getRefereeById,
  updateReferee,
  deleteReferee,
  searchReferees
};
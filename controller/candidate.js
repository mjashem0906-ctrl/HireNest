
//---------20/01-------------3.14--------------------------

const Candidate = require("../models/candidate");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { triggerNotification } = require("../utils/notificationHelper");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/resumes/";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "resume-" + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".doc", ".docx"];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, and DOCX files are allowed"), false);
  }
};

// Create multer instance
exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// ✅ Register new candidate
exports.registerCandidate = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      qualification,
      experience,
      skills,
      authSource = "google"
    } = req.body;

    // Check if candidate already exists
    const existingCandidate = await Candidate.findOne({ email });
    if (existingCandidate) {
      return res.status(400).json({
        success: false,
        message: "Candidate with this email already exists"
      });
    }

    // Parse skills if it's a string
    let skillsArray = [];
    if (skills) {
      if (typeof skills === "string") {
        skillsArray = skills.split(",").map(skill => skill.trim()).filter(skill => skill);
      } else if (Array.isArray(skills)) {
        skillsArray = skills;
      }
    }

    // Prepare candidate data
    const candidateData = {
      firstName,
      lastName,
      email,
      phone,
      address,
      qualification,
      experience: experience ? parseInt(experience) : 0,
      skills: skillsArray,
      authSource
    };

    // Add resume info if file was uploaded OR Cloudinary URL provided
    if (req.file) {
      // Local file upload
      candidateData.resume = {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        storageType: "local"
      };
    } else if (req.body.resumeUrl) {
      // Cloudinary URL
      candidateData.resume = {
        filename: "resume-cloudinary",
        path: req.body.resumeUrl,
        mimetype: "application/pdf", // Default, adjust as needed
        storageType: "cloudinary",
        cloudinaryUrl: req.body.resumeUrl
      };
    }

    // Save candidate to database
    const candidate = await Candidate.create(candidateData);

    // Remove sensitive/irrelevant data from response
    const candidateResponse = candidate.toObject();
    delete candidateResponse.__v;

    // Add resume URL to response
    if (candidate.resume) {
      if (candidate.resume.storageType === "local") {
        candidateResponse.resumeUrl = `/api/candidate/resume/${candidate.resume.filename}`;
      } else if (candidate.resume.storageType === "cloudinary") {
        candidateResponse.resumeUrl = candidate.resume.cloudinaryUrl;
      }
    }

    // --- NOTIFICATIONS WORKFLOW TRIGGER ---
    try {
      await triggerNotification({
        type: "system_notification",
        recipientId: null, // Broadcast to Admin
        title: "New Candidate Registration",
        message: `A new candidate "${firstName} ${lastName}" has registered and is pending approval.`,
        relatedId: candidate._id,
        relatedModel: "Candidate"
      });
    } catch (notificationError) {
      console.error("Failed to trigger candidate registration notification:", notificationError);
    }

    res.status(201).json({
      success: true,
      message: "Candidate registered successfully",
      data: candidateResponse
    });

  } catch (error) {
    console.error("Error registering candidate:", error);
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error while registering candidate",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

// ✅ Get candidate profile
exports.getCandidateProfile = async (req, res) => {
  try {
    // Try to get email from query params or JWT token
    let email = req.query.email;
    
    // If no email in query, try to get from JWT token (if implemented)
    if (!email && req.user) {
      email = req.user.email;
    }
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required or user must be authenticated"
      });
    }

    const candidate = await Candidate.findOne({ email });
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    // Prepare response
    const candidateResponse = candidate.toObject();
    delete candidateResponse.__v;
    
    // Generate resume URL based on storage type
    if (candidate.resume) {
      if (candidate.resume.storageType === "local") {
        candidateResponse.resumeUrl = `/api/candidate/resume/${candidate.resume.filename}`;
      } else if (candidate.resume.storageType === "cloudinary") {
        candidateResponse.resumeUrl = candidate.resume.cloudinaryUrl;
      }
    }

    res.status(200).json({
      success: true,
      data: candidateResponse
    });

  } catch (error) {
    console.error("Error fetching candidate profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile"
    });
  }
};

// ✅ Serve resume file (for local storage only)
exports.serveResume = async (req, res) => {
  try {
    const { filename } = req.params;
    
    const candidate = await Candidate.findOne({ 
      "resume.filename": filename,
      "resume.storageType": "local"
    });
    
    if (!candidate || !candidate.resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found or not stored locally"
      });
    }

    const filePath = path.join(__dirname, "..", candidate.resume.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server"
      });
    }

    // Set appropriate headers
    res.setHeader("Content-Type", candidate.resume.mimetype);
    res.setHeader("Content-Disposition", `inline; filename="${candidate.resume.filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error("Error serving resume:", error);
    res.status(500).json({
      success: false,
      message: "Error serving resume file"
    });
  }
};

// ✅ Get all candidates (for admin)
exports.getAllCandidates = async (req, res) => {
  try {
    const candidates = await Candidate.find()
      .select("-__v")
      .sort({ createdAt: -1 });

    // Add resume URLs for each candidate
    const candidatesWithUrls = candidates.map(candidate => {
      const candidateObj = candidate.toObject();
      
      if (candidate.resume) {
        if (candidate.resume.storageType === "local") {
          candidateObj.resumeUrl = `/api/candidate/resume/${candidate.resume.filename}`;
        } else if (candidate.resume.storageType === "cloudinary") {
          candidateObj.resumeUrl = candidate.resume.cloudinaryUrl;
        }
      }
      
      return candidateObj;
    });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidatesWithUrls
    });

  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching candidates"
    });
  }
};

// ✅ Update candidate profile
exports.updateCandidateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle skills if provided as string
    if (updateData.skills && typeof updateData.skills === "string") {
      updateData.skills = updateData.skills.split(",").map(skill => skill.trim()).filter(skill => skill);
    }

    // Handle experience conversion
    if (updateData.experience) {
      updateData.experience = parseInt(updateData.experience);
    }

    // Handle resume update
    let resumeUpdate = {};
    
    if (req.file) {
      // Local file upload
      resumeUpdate = {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        storageType: "local"
      };

      // Delete old local resume file if exists
      const oldCandidate = await Candidate.findById(id);
      if (oldCandidate && oldCandidate.resume && oldCandidate.resume.storageType === "local" && oldCandidate.resume.path) {
        const oldPath = path.join(__dirname, "..", oldCandidate.resume.path);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      updateData.resume = resumeUpdate;
      
    } else if (req.body.resumeUrl) {
      // Cloudinary URL
      resumeUpdate = {
        filename: "resume-cloudinary",
        path: req.body.resumeUrl,
        mimetype: req.body.resumeMimeType || "application/pdf",
        storageType: "cloudinary",
        cloudinaryUrl: req.body.resumeUrl
      };
      
      updateData.resume = resumeUpdate;
    }

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select("-__v");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    // Add resume URL to response
    const responseCandidate = candidate.toObject();
    if (candidate.resume) {
      if (candidate.resume.storageType === "local") {
        responseCandidate.resumeUrl = `/api/candidate/resume/${candidate.resume.filename}`;
      } else if (candidate.resume.storageType === "cloudinary") {
        responseCandidate.resumeUrl = candidate.resume.cloudinaryUrl;
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: responseCandidate
    });

  } catch (error) {
    console.error("Error updating candidate profile:", error);
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error while updating profile"
    });
  }
};

// ✅ Check if candidate exists by email
exports.checkCandidateExists = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email parameter is required"
      });
    }

    const candidate = await Candidate.findOne({ email })
      .select("email firstName lastName status authSource resume");
    
    // Add resume URL if exists
    let candidateData = null;
    if (candidate) {
      candidateData = candidate.toObject();
      
      if (candidate.resume) {
        if (candidate.resume.storageType === "local") {
          candidateData.resumeUrl = `/api/candidate/resume/${candidate.resume.filename}`;
        } else if (candidate.resume.storageType === "cloudinary") {
          candidateData.resumeUrl = candidate.resume.cloudinaryUrl;
        }
      }
    }

    res.status(200).json({
      success: true,
      exists: !!candidate,
      data: candidateData
    });

  } catch (error) {
    console.error("Error checking candidate:", error);
    res.status(500).json({
      success: false,
      message: "Server error while checking candidate"
    });
  }
};

// ✅ Get candidate by ID (for admin)
exports.getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id).select("-__v");

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    // Add resume URL
    const candidateResponse = candidate.toObject();
    if (candidate.resume) {
      if (candidate.resume.storageType === "local") {
        candidateResponse.resumeUrl = `/api/candidate/resume/${candidate.resume.filename}`;
      } else if (candidate.resume.storageType === "cloudinary") {
        candidateResponse.resumeUrl = candidate.resume.cloudinaryUrl;
      }
    }

    res.status(200).json({
      success: true,
      data: candidateResponse
    });

  } catch (error) {
    console.error("Error fetching candidate by ID:", error);
    
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate ID"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error while fetching candidate"
    });
  }
};

// ✅ Delete candidate (admin only)
exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    // Delete local resume file if exists
    if (candidate.resume && candidate.resume.storageType === "local" && candidate.resume.path) {
      const filePath = path.join(__dirname, "..", candidate.resume.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Candidate.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Candidate deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting candidate:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting candidate"
    });
  }
};
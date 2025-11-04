const Service = require("../models/service");
const multer = require("multer");
const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Configure multer with file filtering and limits
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// Google Drive setup
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../credentials.json"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});
const drive = google.drive({ version: "v3", auth });

const addServicePost = async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.title) {
      return res.status(400).json({ 
        success: false, 
        message: "Title is required" 
      });
    }

    let imageUrl = null;
    let localFilePath = null;

    try {
      // Process image if uploaded
      if (req.file) {
        localFilePath = req.file.path;
        
        // Generate unique filename
        const uniqueFilename = `${uuidv4()}${path.extname(req.file.originalname)}`;
        
        // Upload to Google Drive
        const fileMetadata = { 
          name: uniqueFilename,
          parents: ["11hhHf6_IZpEkysvMBkn0pH6cVuPRD8vr"]
        };

        const media = { 
          mimeType: req.file.mimetype, 
          body: fs.createReadStream(localFilePath) 
        };

        const driveFile = await drive.files.create({
          resource: fileMetadata,
          media,
          supportsAllDrives: true, // Important for shared drives
          fields: "id",
        });

        // Make file public
        await drive.permissions.create({
          fileId: driveFile.data.id,
          supportsAllDrives: true,
          requestBody: { 
            role: "reader", 
            type: "anyone" 
          },
        });

        imageUrl = `https://drive.google.com/uc?id=${driveFile.data.id}`;
      }

      // Save to MongoDB
      const service = new Service({
        title: req.body.title,
        description: req.body.description || "", // Default empty string
        image: imageUrl,
        memberId:req.body.memberId
      });

      await service.save();

      // Cleanup local file if it exists
      if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }

      return res.status(201).json({ 
        success: true, 
        data: service,
        message: "Service post created successfully"
      });

    } catch (uploadError) {
      // Cleanup local file if upload failed
      if (localFilePath && fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
      throw uploadError; // Re-throw to be caught by outer catch
    }

  } catch (error) {
    console.error("Error in addServicePost:", error);
    
    let errorMessage = "Upload failed";
    if (error.message.includes("storage quota")) {
      errorMessage = "Storage quota exceeded. Please check Google Drive permissions.";
    } else if (error.message.includes("image files")) {
      errorMessage = "Only image files are allowed";
    }

    return res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const getServicePost = async (req, res) => {
  try {
    const services = await Service.find().populate("memberId", "name email photoUrl")  // populate member info
    res.json({ success: true, data: services });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch services" 
    });
  }
};

const deleteServicePost = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    
    if (!service) {
      return res.status(404).json({ 
        success: false, 
        message: "Service not found" 
      });
    }

    // Optional: Add code to delete from Google Drive if needed
    
    res.json({ 
      success: true, 
      message: "Service deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to delete service" 
    });
  }
};

module.exports = {
  addServicePost,
  getServicePost,
  deleteServicePost,
  upload
};
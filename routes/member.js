//----------------------------14/01----------------------------12.24---------------------------

const express = require("express");
const { getAllMembers, getMemberById, updateMember, deleteMember, addMember } = require("../controller/member");
const verifyToken = require('../middleware/auth');
const router = express.Router();

// --- 1. Import and Configure Multer ---
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure 'uploads' directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Files will be saved in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    // Save as: timestamp-filename.extension
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
  }
});

const upload = multer({ storage: storage });

// Configure upload fields (must match the names used in frontend FormData)
const uploadFields = upload.fields([
  { name: 'photo', maxCount: 1 }, 
  { name: 'resume', maxCount: 1 }
]);

// --- Routes ---

router.get("/", verifyToken, getAllMembers);       
router.get("/:id", verifyToken, getMemberById);

// --- 2. Add 'uploadFields' middleware to POST and PUT ---
// Note: We typically don't need verifyToken for Add Member if it's public registration, 
// but if it is Admin only, add verifyToken before uploadFields.
router.post('/', uploadFields, addMember);                   

router.put("/:id", verifyToken, uploadFields, updateMember);    

router.delete("/:id", verifyToken, deleteMember); // Assuming checkRole/authorizeRoles logic is inside or handled

module.exports = router;
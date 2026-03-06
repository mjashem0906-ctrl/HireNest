// const express = require("express");
// const router = express.Router();
// const { 
//     getAllMembers, 
//     getMemberById, 
//     updateMember, 
//     deleteMember, 
//     addMember 
// } = require("../controller/member"); // Ensure this path is correct
// const verifyToken = require('../middleware/auth');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // --- 1. Configure Multer ---
// const uploadDir = 'uploads';
// if (!fs.existsSync(uploadDir)){
//     fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
// });

// const upload = multer({ storage: storage });
// const uploadFields = upload.fields([
//   { name: 'photo', maxCount: 1 }, 
//   { name: 'resume', maxCount: 1 }
// ]);

// // --- 2. Routes ---

// // Public or Protected depending on your needs
// router.get("/", verifyToken, getAllMembers);       
// router.get("/:id", verifyToken, getMemberById);

// // Add Member (Supports file uploads for photo/resume)
// router.post("/", uploadFields, addMember);                  

// // Update Member
// router.put("/:id", verifyToken, uploadFields, updateMember);    

// // Delete Member
// router.delete("/:id", verifyToken, deleteMember);

// module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  addMember,
} = require("../controller/member");
const verifyToken = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- 1. Configure Multer ---
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-")),
});

const upload = multer({ storage: storage });
const uploadFields = upload.fields([
  { name: "photo", maxCount: 1 },
  { name: "resume", maxCount: 1 },
]);

// --- 2. Routes ---
router.get("/", verifyToken, getAllMembers);
router.get("/:id", verifyToken, getMemberById);

router.post("/", uploadFields, addMember);

router.put("/:id", verifyToken, uploadFields, updateMember);

router.delete("/:id", verifyToken, deleteMember);

module.exports = router;
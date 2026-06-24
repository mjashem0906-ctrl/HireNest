const express = require("express");
const router = express.Router();
const { sendCandidateToRecruiter } = require("../controller/sendToRecruiter");
const verifyToken = require("../middleware/auth");

// POST /api/send-to-recruiter
// Admin only: send candidate details + resume to a recruiter
router.post("/", verifyToken, sendCandidateToRecruiter);

module.exports = router;

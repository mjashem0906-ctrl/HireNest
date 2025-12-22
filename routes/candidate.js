const express = require("express");
const router = express.Router();
const candidateController = require("../controller/candidate");
const verifyToken = require("../middleware/auth");

// Public routes
router.post(
  "/register",
  candidateController.upload.single("resume"),
  candidateController.registerCandidate
);

router.get("/profile", candidateController.getCandidateProfile);
router.get("/check", candidateController.checkCandidateExists);
router.get("/resume/:filename", candidateController.serveResume);

// Protected routes (require authentication)
router.get(
  "/all",
  verifyToken,
  // Add role authorization if needed: authorizeRoles("Admin"),
  candidateController.getAllCandidates
);

router.put(
  "/:id",
  verifyToken,
  candidateController.upload.single("resume"),
  candidateController.updateCandidateProfile
);

module.exports = router;
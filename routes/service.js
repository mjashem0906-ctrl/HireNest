//------------------------16/01----------------1.12-------

const express = require("express");
const verifyToken = require("../middleware/auth");
const router = express.Router();

const {
  getServicePost,
  addServicePost,
  deleteServicePost,
  getSingleServicePost,
  applyToService,
  updateStatus,
  updateServicePost 
} = require("../controller/service");

// --- ROUTES ---

// Create a Job Post (Ideally should be protected with verifyToken)
router.post('/', addServicePost); 

// Apply to a specific Job
router.post("/:id/apply", verifyToken, applyToService);

// Get specific Job Details
router.get("/:id", verifyToken, getSingleServicePost);

// Get All Jobs
router.get('/', verifyToken, getServicePost);

// Delete a Job
router.delete('/:id', verifyToken, deleteServicePost);

// Update Application Status (Must be defined BEFORE /:id patch route)
router.patch('/status', verifyToken, updateStatus);

// Edit/Update a Job Post
router.patch('/:id', verifyToken, updateServicePost); 

module.exports = router;
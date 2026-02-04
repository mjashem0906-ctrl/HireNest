
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
  updateServicePost,
  getServiceApplications,
  bulkCreateServices
} = require("../controller/service");

// --- ROUTES ---

// Create a Job Post (PROTECTED - only logged in users can create jobs)
router.post('/', verifyToken, addServicePost);

// Apply to a specific Job
router.post("/:id/apply", verifyToken, applyToService);

// Get specific Job Details
router.get("/:id", verifyToken, getSingleServicePost);

// Get All Jobs
router.get('/', verifyToken, getServicePost);

// Delete a Job
router.delete('/:id', verifyToken, deleteServicePost);

// Update Application Status
router.patch('/status', verifyToken, updateStatus);

// Edit/Update a Job Post
router.patch('/:id', verifyToken, updateServicePost);

// Get applications for a specific service (Admin only)
router.get('/:id/applications', verifyToken, getServiceApplications);

// Bulk create services (Admin only)
router.post('/bulk', verifyToken, bulkCreateServices);

module.exports = router;
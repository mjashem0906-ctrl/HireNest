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
  bulkCreateServices,
  linkJobToReferee,
  getUnlinkedJobs
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

// Get unlinked jobs (jobs without a referee assigned)
router.get('/unlinked/list', verifyToken, getUnlinkedJobs);

// Delete a Job
router.delete('/:id', verifyToken, deleteServicePost);

// Update Application Status
router.patch('/status', verifyToken, updateStatus);

// Edit/Update a Job Post
router.patch('/:id', verifyToken, updateServicePost);

// Get applications for a specific service/job (Admin only)
router.get('/:id/applications', verifyToken, getServiceApplications);

// Bulk create services/jobs (Admin only)
router.post('/bulk', verifyToken, bulkCreateServices);

// Link/Assign a referee to a job
router.patch('/:serviceId/link-referee', verifyToken, linkJobToReferee);

module.exports = router;

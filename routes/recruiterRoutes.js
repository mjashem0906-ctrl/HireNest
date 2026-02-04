//------------------------------------------------28.01------------------------12.40-------------------

const express = require('express');
const router = express.Router();
// ⚠️ IMPORTANT: Ensure your folder is named 'controller' or 'controllers' based on your folder structure
const { 
  addRecruiter, 
  getRecruiters, 
  getRecruiterById,
  updateRecruiter, // New
  deleteRecruiter  // New
} = require('../controller/recruiterController');

// 1. POST /api/recruiters (Add New)
router.post('/', addRecruiter);

// 2. GET /api/recruiters (List All)
router.get('/', getRecruiters);

// 3. GET /api/recruiters/:id (Get Single Detail)
router.get('/:id', getRecruiterById);

// 4. PUT /api/recruiters/:id (Update/Edit)
router.put('/:id', updateRecruiter);

// 5. DELETE /api/recruiters/:id (Delete)
router.delete('/:id', deleteRecruiter);

module.exports = router;
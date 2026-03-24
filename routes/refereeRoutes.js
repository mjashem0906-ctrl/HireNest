// routes/refereeRoutes.js
const express = require('express');
const router = express.Router();
const { 
  addReferee,
  getRefereeReferredJobs 
} = require('../controller/refereeController');

// POST request to add a referee
router.post('/add', addReferee);

// GET referred jobs for a specific referee
router.get('/:refereeId/referred-jobs', getRefereeReferredJobs);

module.exports = router;
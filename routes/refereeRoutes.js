// routes/refereeRoutes.js
const express = require('express');
const router = express.Router();
const { addReferee } = require('../controller/refereeController');

// POST request to add a referee
router.post('/add', addReferee);

module.exports = router;
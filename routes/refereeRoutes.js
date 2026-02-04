// routes/refereeRoutes.js
const express = require('express');
const router = express.Router();
const { addReferee } = require('../controller/refereeController');

// POST request to add a referee
router.post('/add', addReferee);

// In your App.js or routing file
import RefereeDetailsPage from './pages/RefereeDetailsPage';

// Add this route
<Route path="/referee/:id" element={<RefereeDetailsPage />} />

module.exports = router;
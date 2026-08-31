const express = require("express");
const router = express.Router();
const { recordVisit, getViewStats } = require("../controller/portalViewController");

// Public route to record a valid portal visit/open
router.post("/record", recordVisit);

// Route to fetch view statistics for dashboard
router.get("/stats", getViewStats);

module.exports = router;

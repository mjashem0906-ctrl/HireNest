const express = require("express");
const router = express.Router();
const {addDropdown, getDropdown} = require("../controller/dropdown");
const verifyToken = require('../middleware/auth')

router.get("/",verifyToken,getDropdown);
router.post("/",verifyToken,addDropdown);

module.exports = router;
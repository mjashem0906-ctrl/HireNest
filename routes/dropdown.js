const express = require("express");
const router = express.Router();
const {addDropdown, getDropdown} = require("../controller/dropdown");
const verifyToken = require('../middleware/auth')
const authorizeRoles = require('../middleware/authorize')

router.get("/",verifyToken,getDropdown);
router.post("/",verifyToken,authorizeRoles('Admin') ,addDropdown);

module.exports = router;
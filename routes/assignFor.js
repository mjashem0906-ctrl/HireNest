const express = require('express');
const {createAssignFor,getAssignForById,getAllAssignFor,deleteAssignFor,updateAssignFor} =require('../controller/assignFor');
const router = express.Router();
const verifyToken = require('../middleware/auth')
const authorizeRoles = require('../middleware/authorize')

// CRUD routes
router.post("/",verifyToken,authorizeRoles('Admin'), createAssignFor);
router.get("/",verifyToken, getAllAssignFor);
router.get("/:id", verifyToken, getAssignForById);
router.put("/:id", verifyToken,authorizeRoles('Admin') ,updateAssignFor);
router.delete("/:id", verifyToken,authorizeRoles('Admin'), deleteAssignFor);

module.exports = router;

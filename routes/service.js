const express = require("express");
const verifyToken = require("../middleware/auth");
const router = express.Router();

// 1. IMPORT THE NEW FUNCTION HERE
const {
  getServicePost,
  addServicePost,
  deleteServicePost,
  getSingleServicePost,
  applyToService,
  updateStatus,
  updateServicePost // <--- Added this
} = require("../controller/service");


router.post('/', addServicePost); 
router.post("/:id/apply", verifyToken, applyToService);
router.get("/:id", verifyToken, getSingleServicePost);
router.get('/', verifyToken, getServicePost);
router.delete('/:id', verifyToken, deleteServicePost);
router.patch('/status', verifyToken, updateStatus);

// 2. ADD THE ROUTE TO HANDLE THE EDIT REQUEST
router.patch('/:id', verifyToken, updateServicePost); 

module.exports = router;
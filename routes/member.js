const express = require("express");
const { getAllMembers, getMemberById, updateMember, deleteMember, addMember } = require("../controller/member");
const verifyToken = require('../middleware/auth'); // You named it verifyToken here
const authorizeRoles = require('../middleware/authorize');
const router = express.Router();

// ✅ This line is correct. It uses verifyToken (not authMiddleware)
// and because 'authorizeRoles' is removed, ALL logged-in users can fetch members.
router.get("/", verifyToken, getAllMembers);       

router.get("/:id", verifyToken, getMemberById);    // GET single member
router.post('/', addMember);                       // Add Member
router.put("/:id", verifyToken, updateMember);     // UPDATE member
router.delete("/:id", verifyToken, authorizeRoles('Admin'), deleteMember); // DELETE (Admins only)

module.exports = router;
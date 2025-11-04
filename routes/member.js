const express = require("express");
const {getAllMembers, getMemberById,updateMember,deleteMember,addMember} = require("../controller/member");
const verifyToken = require('../middleware/auth')
const authorizeRoles = require('../middleware/authorize')
const router = express.Router();

router.get("/",verifyToken, getAllMembers);       // GET all members
router.get("/:id",verifyToken, getMemberById);    // GET single member
router.post('/', addMember);    //add Member from sheet
router.patch("/:id",verifyToken,authorizeRoles('Admin') , updateMember);     // UPDATE member
router.delete("/:id",verifyToken,authorizeRoles('Admin') ,deleteMember) //delete Member

module.exports = router;

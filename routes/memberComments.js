const express = require("express");
const {createMemberComments,getAllMemberComments,updateMemberComments,deleteMemberComments} = require("../controller/memberComment");
const verifyToken = require('../middleware/auth')
const authorizeRoles = require('../middleware/authorize')
const router = express.Router();

router.post("/",verifyToken,authorizeRoles('Admin') , createMemberComments);
router.get("/",verifyToken,getAllMemberComments);
router.put("/:id",verifyToken,authorizeRoles('Admin') , updateMemberComments);
router.delete("/:id",verifyToken,authorizeRoles('Admin') ,deleteMemberComments);

module.exports = router;
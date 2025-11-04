const express = require('express');
const router=express.Router();
const {login,logOut, check,register,getAllUser} = require("../controller/login");
const verifyToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorize')

router.post("/login",login);
router.post("/logout",logOut);
router.get("/check",verifyToken,check);
router.post("/register",verifyToken,authorizeRoles('Admin'),register);
router.get("/getUser",verifyToken,authorizeRoles("Admin"),getAllUser);

router.post("/registerPostman",register);

module.exports= router;
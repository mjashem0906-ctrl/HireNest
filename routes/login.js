const express = require('express');
<<<<<<< HEAD
const router = express.Router();
const { login, logOut, check, register, getAllUser, updateProfile } = require("../controller/login");
const verifyToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorize')

router.post("/login", login);
router.post("/logout", logOut);
router.get("/check", verifyToken, check);
router.post("/update-profile", verifyToken, updateProfile);
router.post("/register", verifyToken, authorizeRoles('Admin'), register);

router.get("/getUser", verifyToken, authorizeRoles("Admin"), getAllUser);

router.post("/registerPostman", register);

module.exports = router;
=======
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
>>>>>>> 83d05d0a459a0ec8738316ab2b45cddae3775eb8

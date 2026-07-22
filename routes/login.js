const express = require('express');
const router = express.Router();
const { login, logOut, check, register, getAllUser, updateProfile, changePassword, verifyAdminEmail, verifyAdminOtp, changePasswordByEmail } = require("../controller/login");
const verifyToken = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorize')

router.post("/login", login);
router.post("/logout", logOut);
router.get("/check", verifyToken, check);
router.post("/update-profile", verifyToken, updateProfile);
router.post("/register", verifyToken, authorizeRoles('Admin'), register);

router.get("/getUser", verifyToken, authorizeRoles("Admin"), getAllUser);
router.post("/change-password", verifyToken, authorizeRoles('Admin'), changePassword);
router.post("/verify-admin-email", verifyAdminEmail);
router.post("/verify-admin-otp", verifyAdminOtp);
router.post("/change-password-email", changePasswordByEmail);

router.post("/registerPostman", register);

module.exports = router;
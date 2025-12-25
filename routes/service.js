const express = require("express");
const verifyToken = require("../middleware/auth");
const router = express.Router();
const {getServicePost,addServicePost,deleteServicePost,getSingleServicePost,applyToService,updateStatus}= require("../controller/service");


router.post('/', addServicePost); // Store data to mongodb
router.post("/:id/apply", verifyToken, applyToService);
router.get("/:id",verifyToken,getSingleServicePost);
router.get('/',verifyToken,getServicePost);
router.delete('/:id',verifyToken,deleteServicePost);
router.patch('/status',verifyToken,updateStatus);

module.exports = router;
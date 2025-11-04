const express = require("express");
const verifyToken = require("../middleware/auth");
const router = express.Router();
const {getServicePost,addServicePost,deleteServicePost,upload}= require("../controller/service");


router.post('/', upload.single("image"),addServicePost); // Store data to mongodb
router.get('/',verifyToken,getServicePost);
router.delete('/:id',verifyToken,deleteServicePost);

module.exports = router;
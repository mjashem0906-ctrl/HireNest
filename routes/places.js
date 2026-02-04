const express = require("express");
const router= express.Router();
const {addPlace,updatePlace,deletePlace,getPlaces}= require("../controller/places");

router.get("/",getPlaces);
router.delete("/:id",deletePlace);
router.put("/:id",updatePlace);
router.post("/",addPlace);

module.exports = router;

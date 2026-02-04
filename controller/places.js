const Places = require("../models/places");


//Add new places
const addPlace = async(req,res)=>{

}

//Get All places

const getPlaces = async(req,res)=>{
    try{
        const places = await Places.find();
        res.status(200).json(places);
    }catch(error){
        res.status(500).json({ success: false, message: "Failed to fetch Places", error: error.message })
    }
}

//Update place
const updatePlace = async(req,res)=>{
    try {
    const updatedPlace = await Places.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedPlace) {
      return res.status(404).json({ success: false, message: "Place not found" });
    }

    res.status(200).json({ success: true, message: "Place updated successfully", updatedPlace });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update Place", error: error.message });
  }
}

//Delete place
const deletePlace = async(req,res)=>{
    try {
    const deletedPlace = await Places.findByIdAndDelete(req.params.id);

    if (!deletedPlace) {
      return res.status(404).json({ success: false, message: "Place not found" });
    }

    res.status(200).json({ success: true, message: "Place deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete Place", error: error.message });
  }
}

module.exports = {addPlace,updatePlace,deletePlace,getPlaces};
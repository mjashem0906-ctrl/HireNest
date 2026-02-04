const mongoose = require("mongoose");

const placesSchema = new mongoose.Schema({
    district:{
        type:String
    },
    place:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    },
    organisationalStatus:{
        type:String,
        required:true,
    }
},{timestamps:true});

module.exports = mongoose.model("Places",placesSchema);
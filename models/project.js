const mongoose = require("mongoose");

const projectSchema = mongoose.Schema({
    customId: {
    type: String,
    unique: true,
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String
    },
    startDate:{
        type:Date,
        required:true,
    },
    endDate:{
        type:Date,
        required:true
    },
    priority:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    }
    

},{timestamps:true})

module.exports = mongoose.model("Project",projectSchema)
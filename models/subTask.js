const mongoose = require("mongoose");

const subTaskSchema = mongoose.Schema({
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
    assignedTo:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Member",
        required:true
    }],
    projectId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    taskId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Task",
        required:true
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
    },
    district:{
        type:String,
    },
    unit:{
        type:String,
    },place:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Places"
    }
},{timestamps:true})

module.exports = mongoose.model("SubTask",subTaskSchema)
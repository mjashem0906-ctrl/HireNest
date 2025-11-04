const mongoose = require("mongoose");

const taskSchema = mongoose.Schema({
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
     projectId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Project",
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
    }

},{timestamps:true})

module.exports = mongoose.model("Task",taskSchema)
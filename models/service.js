const mongoose = require('mongoose');

const serviceSchema =new mongoose.Schema({
    // customId:{
    //     type:String,
    //     required:true,
    // },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image:{
        type:String,
    },
    // type:{
    //     type:String,
    //     required:true,
    // },
    memberId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Member",
        required:true,
    }
},
    { timestamps: true }
)

module.exports = mongoose.model("Service",serviceSchema);
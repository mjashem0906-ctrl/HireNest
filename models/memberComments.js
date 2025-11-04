const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    customId: {
    type: String,
    unique: true,
    },
    comment:{
        type:String,
        required:true
    },
     memberId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Member",
            required:true
        },

},{timestamps:true})

module.exports = mongoose.model("MemberComments",commentSchema)
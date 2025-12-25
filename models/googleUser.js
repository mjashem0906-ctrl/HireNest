const mongoose = require("mongoose");

const googleUserSchema = new mongoose.Schema({
    googleId: String,  
    name: String,
    email: { type: String, unique: true },
    avatar: String,
});

module.exports = mongoose.model("GoogleUser", googleUserSchema);

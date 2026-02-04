const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true }, // Recommended for recovery
  password: { type: String, required: true },
  // ... keep your other existing fields like role, mobile, etc.
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
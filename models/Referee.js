// models/Referee.js
const mongoose = require('mongoose');

const refereeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  relationship: {
    type: String, // e.g., "Former Manager", "Colleague"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('Referee', refereeSchema);



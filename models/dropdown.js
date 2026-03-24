const mongoose = require("mongoose");

const dropdownSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["desiredRoles", "locationPreferences", "industry"],
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound unique index: category + value
dropdownSchema.index({ category: 1, value: 1 }, { unique: true });

module.exports = mongoose.model("Dropdown", dropdownSchema);
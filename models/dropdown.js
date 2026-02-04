const mongoose = require("mongoose");

const dropdownSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
});

module.exports = mongoose.model("Dropdown", dropdownSchema);
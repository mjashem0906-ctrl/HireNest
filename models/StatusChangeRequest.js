// models/StatusChangeRequest.js
const mongoose = require("mongoose");

const statusChangeRequestSchema = new mongoose.Schema({
  subTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'SubTask', required: true },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member'},
  requestedStatus: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StatusChangeRequest", statusChangeRequestSchema);

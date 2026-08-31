const mongoose = require("mongoose");

const portalViewSchema = new mongoose.Schema(
  {
    date: {
      type: String, // "YYYY-MM-DD" e.g. "2026-08-31"
      required: true,
      unique: true,
      index: true,
    },
    count: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastVisitAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PortalView", portalViewSchema);

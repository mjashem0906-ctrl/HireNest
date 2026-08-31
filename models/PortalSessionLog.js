const mongoose = require("mongoose");

const portalSessionLogSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ip: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    date: {
      type: String, // "YYYY-MM-DD"
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["VISIT", "LOGIN"],
      default: "VISIT",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    firstSeenAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PortalSessionLog", portalSessionLogSchema);

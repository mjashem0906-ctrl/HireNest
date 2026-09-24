const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "Admin",
    },
    email: {
      type: String,
      trim: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: false,
    },
  },
  { timestamps: true, collection: "Admin" }
);

module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema, "Admin");

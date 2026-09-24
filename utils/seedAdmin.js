const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const seedAdmin = async () => {
  try {
    const adminUsername = "admin";
    const defaultPassword = "admin@h26";

    // Check if admin document already exists in Admin collection
    const existingAdmin = await Admin.findOne({
      $or: [
        { username: adminUsername },
        { username: { $regex: new RegExp(`^${adminUsername}$`, "i") } }
      ]
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await Admin.create({
        username: adminUsername,
        password: hashedPassword,
        role: "Admin",
      });
      console.log("✅ Default Admin account seeded successfully in Admin collection.");
    } else {
      console.log("ℹ️ Admin account already exists in Admin collection.");
    }
  } catch (error) {
    console.error("❌ Failed to seed default Admin account in Admin collection:", error);
  }
};

module.exports = seedAdmin;

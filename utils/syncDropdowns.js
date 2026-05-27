const Member = require("../models/member");
const Dropdown = require("../models/dropdown");

const syncDropdowns = async () => {
  try {
    console.log("🔄 Starting automatic sync of dropdown options from existing Member data...");

    // 1. Sync Preferred Job Roles
    const rolesFromPreferred = await Member.distinct("preferredJobRole_Sector");
    const rolesFromCareer = await Member.distinct("careerProfile.role");
    const uniqueRoles = [...new Set([...rolesFromPreferred, ...rolesFromCareer])]
      .map(r => String(r || "").trim())
      .filter(Boolean);

    let syncedRolesCount = 0;
    for (const role of uniqueRoles) {
      // Case-insensitive / exact match check
      const exists = await Dropdown.findOne({ 
        category: "desiredRoles", 
        value: { $regex: new RegExp(`^${role.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") } 
      });
      if (!exists) {
        await Dropdown.create({ category: "desiredRoles", value: role });
        syncedRolesCount++;
      }
    }
    if (syncedRolesCount > 0) {
      console.log(`✅ Synced ${syncedRolesCount} new preferred job roles to Dropdown collection.`);
    }

    // 2. Sync Industries
    const industries = await Member.distinct("careerProfile.industry");
    const uniqueIndustries = [...new Set(industries)]
      .map(i => String(i || "").trim())
      .filter(Boolean);

    let syncedIndustriesCount = 0;
    for (const industry of uniqueIndustries) {
      const exists = await Dropdown.findOne({ 
        category: "industry", 
        value: { $regex: new RegExp(`^${industry.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") } 
      });
      if (!exists) {
        await Dropdown.create({ category: "industry", value: industry });
        syncedIndustriesCount++;
      }
    }
    if (syncedIndustriesCount > 0) {
      console.log(`✅ Synced ${syncedIndustriesCount} new industries to Dropdown collection.`);
    }

    // 3. Sync Locations / Districts
    const districts = await Member.distinct("district");
    const locationsFromCareer = await Member.distinct("careerProfile.location");
    const uniqueLocations = [...new Set([...districts, ...locationsFromCareer])]
      .map(l => String(l || "").trim())
      .filter(Boolean);

    let syncedLocsCount = 0;
    for (const loc of uniqueLocations) {
      const exists = await Dropdown.findOne({ 
        category: "locationPreferences", 
        value: { $regex: new RegExp(`^${loc.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, "i") } 
      });
      if (!exists) {
        await Dropdown.create({ category: "locationPreferences", value: loc });
        syncedLocsCount++;
      }
    }
    if (syncedLocsCount > 0) {
      console.log(`✅ Synced ${syncedLocsCount} new locations to Dropdown collection.`);
    }

    console.log("✅ Dropdown options sync completed successfully.");
  } catch (err) {
    console.error("❌ Failed to sync dropdowns with member data:", err);
  }
};

module.exports = syncDropdowns;

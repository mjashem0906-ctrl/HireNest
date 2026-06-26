const mongoose = require("mongoose");
require("dotenv").config();

const Member = require("../models/member");
const Recruiter = require("../models/Recruiter");

async function resetReferenceNumbers() {
  try {
    const uri = process.env.CONNECTION_STRING || process.env.MONGO_URI;
    if (!uri) {
      throw new Error("No MongoDB connection string found in .env");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("Connected successfully.");

    console.log("Fetching all members and recruiters...");
    const members = await Member.find();
    const recruiters = await Recruiter.find();
    
    // Tag them so we know which collection to update
    const combined = [
      ...members.map(m => ({ doc: m, type: 'Member' })),
      ...recruiters.map(r => ({ doc: r, type: 'Recruiter' }))
    ];
    
    // Sort combined array in memory by parsed date
    combined.sort((a, b) => {
      const getValidDate = (m) => {
        if (m.timestamp) {
          // Attempt to parse string like "8/15/2025 18:23:23"
          const parsed = new Date(m.timestamp);
          if (!isNaN(parsed)) return parsed;
        }
        if (m.createdAt) return new Date(m.createdAt);
        // Fallback to a very old date if no valid date found so they go first
        return new Date(0);
      };
      
      const dateA = getValidDate(a.doc);
      const dateB = getValidDate(b.doc);
      return dateA - dateB;
    });

    console.log(`Found ${combined.length} total records. Applying sorted ref numbers...`);

    for (let i = 0; i < combined.length; i++) {
      const newRefNo = (i + 1).toString();
      const item = combined[i];
      if (item.doc.memberReferenceNumber !== newRefNo) {
        if (item.type === 'Member') {
          await Member.updateOne({ _id: item.doc._id }, { $set: { memberReferenceNumber: newRefNo } });
        } else {
          await Recruiter.updateOne({ _id: item.doc._id }, { $set: { memberReferenceNumber: newRefNo } });
        }
        console.log(`Updated ${item.type} ID ${item.doc._id} with Ref No: ${newRefNo}`);
      }
    }

    console.log("All records have been successfully updated!");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting reference numbers:", error);
    process.exit(1);
  }
}

resetReferenceNumbers();

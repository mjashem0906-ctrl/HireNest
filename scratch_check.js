const mongoose = require("mongoose");
require("dotenv").config();
const Member = require("./models/member");
const Recruiter = require("./models/Recruiter");

async function check() {
  const uri = process.env.CONNECTION_STRING || process.env.MONGO_URI;
  await mongoose.connect(uri);
  const members = await Member.find();
  const recruiters = await Recruiter.find();
  console.log("Total members:", members.length);
  console.log("Total recruiters:", recruiters.length);
  
  const membersWithRef = members.filter(m => m.memberReferenceNumber);
  console.log("Members with Ref No:", membersWithRef.length);
  console.log("Members without Ref No:", members.length - membersWithRef.length);

  const recruitersWithRef = recruiters.filter(r => r.memberReferenceNumber);
  console.log("Recruiters with Ref No:", recruitersWithRef.length);
  console.log("Recruiters without Ref No:", recruiters.length - recruitersWithRef.length);

  const allRefs = [...membersWithRef, ...recruitersWithRef].map(m => parseInt(m.memberReferenceNumber, 10)).sort((a,b) => a - b);
  console.log("Min Ref No:", allRefs[0]);
  console.log("Max Ref No:", allRefs[allRefs.length - 1]);
  console.log("Unique Ref Nos count:", new Set(allRefs).size);

  // Print first 5 members without Ref No
  const membersWithoutRef = members.filter(m => !m.memberReferenceNumber);
  console.log("First 5 members without Ref No:", membersWithoutRef.slice(0, 5).map(m => ({ id: m._id, name: m.name, createdAt: m.createdAt })));

  process.exit(0);
}
check();

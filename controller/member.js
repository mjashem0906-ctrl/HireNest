const Member = require("../models/member");
const Activity = require("../models/activity");





//  Get all members
const getAllMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.status(200).json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ message: "Server error fetching members" });
  }
};

//  Get a single member by ID
const getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const member = await Member.findById(id);

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    res.status(500).json({ message: "Server error fetching member" });
  }
};

// ✅ Update member by ID
const updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      fathersName,
      pointOfContact,
      mobileNumber,
      dateOfBirth,
      collegeName,
      department,
      workingOrStudyingStatus,
      currentInstitutionOrCompany,
      profession,
      maritalStatus,
      otherPersonalNumber,
      personalEmail,
      areaOfInterest,
      ambition,
      expectationsFromSolidarity,
      currentAddress,
      currentDistrict,
      nativePlace,
      memberType,
      forGrouping} = req.body;

    const updatedMember = await Member.findByIdAndUpdate(id,{
      name,
      fathersName,
      pointOfContact,
      mobileNumber,
      dateOfBirth,
      collegeName,
      department,
      workingOrStudyingStatus,
      currentInstitutionOrCompany,
      profession,
      maritalStatus,
      otherPersonalNumber,
      personalEmail,
      areaOfInterest,
      ambition,
      expectationsFromSolidarity,
      currentAddress,
      currentDistrict,
      nativePlace,
      memberType,
      forGrouping} ,
      { new: true, // returns updated document
        runValidators: true, // applies schema validations
      });

    if (!updatedMember) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(updatedMember);
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ message: "Server error updating member" });
  }
};

/*********Delete Project */
const deleteMember=async (req, res) => {
  try {
   
    const deleted = await Member.findByIdAndDelete(req.params.id);
    if (!deleted) {
       
      return res.status(404).json({ message: "Member not found" });
    }
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
   
    res.status(400).json({ message: "Invalid project ID", error });
  }
}


// ✅ Add Member (sync with Google Sheet)
const addMember = async (req, res) => {
  try {
    const secret = req.headers["x-webhook-secret"];
    if (secret !== process.env.WEBHOOK_SECRET) {
      return res.status(403).json({ message: "Unauthorized request" });
    }

    // 🔹 Expecting the same fields as your Google Sheet's Appscript
    const {
      memberReferenceNumber,
      timestamp,
      emailAddress,
      name,
      fathersName,
      pointOfContact,
      mobileNumber,
      dateOfBirth,
      collegeName,
      department,
      workingOrStudyingStatus,
      currentInstitutionOrCompany,
      profession,
      maritalStatus,
      otherPersonalNumber,
      personalEmail,
      photoUrl,
      areaOfInterest,
      ambition,
      expectationsFromSolidarity,
      currentAddress,
      currentDistrict,
      nativePlace,
      resume,
      age,
      memberId,
      memberType
    } = req.body;

    if (!emailAddress) {
      return res.status(400).json({ message: "Email is required" });
    }

    const identifier = { memberReferenceNumber };
      // ➕ Insert new member 
      const member = await Member.findOneAndUpdate(
         identifier,
        {
        memberReferenceNumber,
        timestamp,
        emailAddress,
        name,
        fathersName,
        pointOfContact,
        mobileNumber,
        dateOfBirth,
        collegeName,
        department,
        workingOrStudyingStatus,
        currentInstitutionOrCompany,
        profession,
        maritalStatus,
        otherPersonalNumber,
        personalEmail,
        photoUrl,
        areaOfInterest,
        ambition,
        expectationsFromSolidarity,
        currentAddress,
        currentDistrict,
        nativePlace,
        resume,
        age,
        memberId,
        memberType
      }
    ,
      { new: true, upsert: true } 
    );
    if (member.wasNew) {
        await Activity.create({
            type: 'MEMBER',
            action: 'joined',
            meta: {
              name,
            },
            targetId: member._id,
        });
      }
    res.json({ message: "✅ Member synced successfully", member });
  } catch (err) {
    console.error("❌ Sync Error:", err);
    res.status(500).json({ error: err.message });
  }
};
module.exports={getAllMembers,getMemberById,updateMember,deleteMember,addMember}
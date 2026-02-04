const Member = require("../models/member");
const Activity = require("../models/activity");
const MemberComments = require("../models/memberComments");

// Helper to format ID like S00001
const generateCustomId = async () => {
  const lastMemberComments = await MemberComments.findOne({ customId: { $exists: true } })
    .sort({ createdAt: -1 }) // newest project first
    .select("customId");

  let newNumber = 1;
  if (lastMemberComments && lastMemberComments.customId) {
    const lastNumber = parseInt(lastMemberComments.customId.replace("MC", ""));
    newNumber = lastNumber + 1;
  }

  return `MC${newNumber.toString().padStart(5, "0")}`;
};
// ✅ Create MemberComments
const createMemberComments = async (req, res) => {
  try {
    const { comment,memberId } = req.body;
    const customId = await generateCustomId();
    const newMemberComments = new MemberComments({ customId,comment,memberId  });

    const savedMemberComments = await newMemberComments.save();
    const member = await Member.findById(memberId);


    await Activity.create({
        type: 'COMMENT',
        action: 'created',
        meta: {
          comment,     
          memberName:member.name,
        },
        targetId: savedMemberComments._id,
      });
    res.status(201).json({ success: true, message: "MemberComments created successfully", data: savedMemberComments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create MemberComments", error: error.message });
  }
};

// ✅ Get All MemberCommentss
const getAllMemberComments = async (req, res) => {
  try {
    const memberComments = await MemberComments.find()
      .populate("memberId","name email photoUrl currentDistrict")
      
      
      
    res.status(200).json({ success: true, data: memberComments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch MemberCommentss", error: error.message });
  }
};

// ✅ Update MemberComments
const updateMemberComments = async (req, res) => {
  try {
    const updatedMemberComments = await MemberComments.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedMemberComments) {
      return res.status(404).json({ success: false, message: "MemberComments not found" });
    }

    res.status(200).json({ success: true, message: "MemberComments updated successfully", data: updatedMemberComments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update MemberComments", error: error.message });
  }
};

// ✅ Delete MemberComments
const deleteMemberComments = async (req, res) => {
  try {
    const deletedMemberComments = await MemberComments.findByIdAndDelete(req.params.id);

    if (!deletedMemberComments) {
      return res.status(404).json({ success: false, message: "MemberComments not found" });
    }

    res.status(200).json({ success: true, message: "MemberComments deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete MemberComments", error: error.message });
  }
};


module.exports={createMemberComments,getAllMemberComments,updateMemberComments,deleteMemberComments}
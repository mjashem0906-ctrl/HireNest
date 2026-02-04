const AssignFor = require('../models/assignFor');
const Activity = require('../models/activity')
const SubTask = require("../models/subTask");
const Member =require('../models/member');

// Helper to format ID like AF00001
const generateCustomId = async () => {
  const lastAssignFor = await AssignFor.findOne({ customId: { $exists: true } })
    .sort({ createdAt: -1 }) // newest assignFor first
    .select("customId");

  let newNumber = 1;
  if (lastAssignFor && lastAssignFor.customId) {
    const lastNumber = parseInt(lastAssignFor.customId.replace("AF", ""));
    newNumber = lastNumber + 1;
  }

  return `AF${newNumber.toString().padStart(5, "0")}`;
};

// ✅ Create AssignFor
const createAssignFor = async (req, res) => {
  try {
    const {  description, assignedFor, taskId,subTaskId, date,currentDistrict, status,projectId } = req.body;
    const customId = await generateCustomId();
    const newAssignFor = new AssignFor({customId, description, assignedFor, taskId,subTaskId, date,currentDistrict, status,projectId });

    const savedAssignFor = await newAssignFor.save();
    const subTask = await SubTask.findById(subTaskId);
    const members = await Member.find({_id:{$in:assignedFor}});
    await Activity.create({
      type:'ASSIGNFOR',
      action:'created',
      meta:{
        subTaskTitle:subTask.title,
        memberNames:members.map(m=>m.name)
      },
      targetId: savedAssignFor._id,
    })
    res.status(201).json({ success: true, message: "AssignFOr created successfully", data: savedAssignFor });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create assignFor", error: error.message });
  }
};

// ✅ Get All AssignFor
const getAllAssignFor = async (req, res) => {
  try {
    const assignFor = await AssignFor.find()
      .populate("assignedFor", "name email photoUrl currentDistrict")  // populate member info
      .populate("taskId", "title customId") // populate task title
      .populate("subTaskId","title customId") // populate subtask title
      .populate("projectId","title customId")  // populate project title
                

    res.status(200).json({ success: true, data: assignFor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch AssignFor", error: error.message });
  }
};

// ✅ Get Single AssignFor by ID
const getAssignForById = async (req, res) => {
  try {
    const assignFor = await AssignFor.findById(req.params.id)
      .populate("assignedFor", "name email photoUrl currentDistrict")
      .populate("taskId", "title customId")
      .populate("subTaskId","title customId") // populate subtask title
      .populate("projectId","title customId")  // populate project title

    if (!assignFor) {
      return res.status(404).json({ success: false, message: "AssignFor not found" });
    }

    res.status(200).json({ success: true, data: assignFor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch AssignFor", error: error.message });
  }
};

// ✅ Update AssignFor
const updateAssignFor = async (req, res) => {
  try {
    const updatedAssignFor = await AssignFor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedAssignFor) {
      return res.status(404).json({ success: false, message: "AssignFor not found" });
    }

    res.status(200).json({ success: true, message: "AssignFor updated successfully", data: updatedAssignFor });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update AssignFor", error: error.message });
  }
};

// ✅ Delete AssignFor
const deleteAssignFor = async (req, res) => {
  try {
    const deletedAssignFor = await AssignFor.findByIdAndDelete(req.params.id);

    if (!deletedAssignFor) {
      return res.status(404).json({ success: false, message: "AssignFor not found" });
    }

    res.status(200).json({ success: true, message: "AssignFor deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete AssignFor", error: error.message });
  }
};


module.exports={createAssignFor,getAllAssignFor,getAssignForById,updateAssignFor,deleteAssignFor}
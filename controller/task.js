const Activity = require("../models/activity");
const Task = require("../models/task");
const Project = require("../models/project")


// Helper to format ID like T00001
const generateCustomId = async () => {
  const lastTask = await Task.findOne({ customId: { $exists: true } })
    .sort({ createdAt: -1 }) // newest Task first
    .select("customId");

  let newNumber = 1;
  if (lastTask && lastTask.customId) {
    const lastNumber = parseInt(lastTask.customId.replace("T", ""));
    newNumber = lastNumber + 1;
  }

  return `T${newNumber.toString().padStart(5, "0")}`;
};

// ✅ Create Task
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, startDate, endDate, priority, status } = req.body;
    const customId = await generateCustomId();
    const newTask = new Task({
      customId,
      title,
      description,
      projectId,
      startDate,
      endDate,
      priority,
      status
    });

    const savedTask = await newTask.save();
    const project = await Project.findById(projectId);
    await Activity.create({
        type: 'TASK',
        action: 'created',
        meta: {
          title,        // task title
          projectTitle: project.title
        },
        targetId: savedTask._id,
      });
    res.status(201).json({ success: true, message: "Task created successfully", data: savedTask });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create task", error: error.message });
  }
};

// ✅ Get All Tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("projectId", "title"); // populate project name
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks", error: error.message });
  }
};

// ✅ Get Single Task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("projectId", "title");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch task", error: error.message });
  }
};

// ✅ Update Task
 const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task updated successfully", data: updatedTask });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update task", error: error.message });
  }
};

// ✅ Delete Task
const deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.status(200).json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete task", error: error.message });
  }
};

module.exports={createTask,getAllTasks,getTaskById,updateTask,deleteTask}
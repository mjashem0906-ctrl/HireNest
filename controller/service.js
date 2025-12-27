const Service = require("../models/service");

/* -------------------- CREATE SERVICE (ADMIN ONLY) -------------------- */
const addServicePost = async (req, res) => {
  try {
    console.log(req.body);
    // UPDATED: Destructure new fields here
    const { title, description, companyName, employmentType, location } = req.body;

    // --- DUPLICATE CHECK START ---
    const existingPost = await Service.findOne({
      title: title,
      description: description,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) } 
    });

    if (existingPost) {
      console.log("Duplicate post blocked");
      return res.status(200).json({
        success: true,
        message: "Service created successfully", 
        data: existingPost
      });
    }

    const service = await Service.create({
      title,
      description,
      // UPDATED: Save new fields
      companyName,
      employmentType,
      location,
      // memberId: req.user.memberId,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service
    });
  } catch (error) {
    console.error("addServicePost error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create service",
    });
  }
};

/* -------------------- GET ALL SERVICES (PUBLIC) -------------------- */
const getServicePost = async (req, res) => {
  try {
    const services = await Service.find()
      .populate("memberId", "name email role")
      .populate({
        path: "appliedMembers.memberId",
        select: "name email role",
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("getServicePost error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
    });
  }
};

/* -------------------- DELETE SERVICE (ADMIN ONLY) -------------------- */
const deleteServicePost = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete services",
      });
    }

    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("deleteServicePost error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};

const getSingleServicePost = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("memberId", "name email")
      .populate("appliedMembers.memberId", "name email");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("getSingleServicePost error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service",
    });
  }
};

/* -------------------- APPLY TO SERVICE (MEMBER) -------------------- */
const applyToService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    const memberId = req.user.memberId;

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    const alreadyApplied = service.appliedMembers.some(
      (a) => String(a.memberId) === String(memberId)
    );

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: "Already applied" });
    }

    service.appliedMembers.push({
      memberId,
      status: 'Applied',
      appliedDate: new Date()
    });
    await service.save();

    res.json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.error("applyToService error:", error);
    res.status(500).json({ success: false, message: "Application failed" });
  }
};

/* -------------------- UPDATE APPLICATION STATUS (ADMIN) -------------------- */
const updateStatus = async (req, res) => {
  try {
    const { jobId, memberId, status } = req.body;

    const updatedJob = await Service.findOneAndUpdate(
      { _id: jobId, "appliedMembers.memberId": memberId },
      {
        $set: { "appliedMembers.$.status": status }
      },
      { new: true } 
    )
      .populate("memberId", "name email") 
      .populate("appliedMembers.memberId", "name email"); 

    if (!updatedJob) {
      return res.status(404).json({ message: "Job or Applicant not found" });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedJob
    });
  } catch (error) {
    console.error("updateStatus error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* -------------------- NEW: UPDATE SERVICE POST (EDIT JOB) -------------------- */
const updateServicePost = async (req, res) => {
  try {
    const { id } = req.params;
    // UPDATED: Destructure new fields here
    const { title, description, companyName, employmentType, location } = req.body;

    // Find the job by ID and update it with the new fields
    const updatedService = await Service.findByIdAndUpdate(
      id,
      // UPDATED: Update all fields
      { title, description, companyName, employmentType, location },
      { new: true } // Returns the updated document
    );

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: "Service post not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    console.error("updateServicePost error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};

module.exports = {
  addServicePost,
  getServicePost,
  deleteServicePost,
  getSingleServicePost,
  applyToService,
  updateStatus,
  updateServicePost 
};
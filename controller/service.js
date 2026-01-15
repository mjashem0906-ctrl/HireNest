//---------------------------15/01-----------------12.56-----------------

const Service = require("../models/service");
const Member = require("../models/member");
const { 
  sendJobPostNotification, 
  sendStatusUpdateNotification, 
  sendAdminApplicationNotification 
} = require("../utils/emailService");

/* -------------------- CREATE SERVICE (ADMIN ONLY) -------------------- */
const addServicePost = async (req, res) => {
  try {
    const { 
      title, description, companyName, employmentType, location, 
      education, passedOutYear, experience, salary, role, keySkills, refereedBy 
    } = req.body;

    // --- DUPLICATE CHECK ---
    const existingPost = await Service.findOne({
      title: title,
      description: description,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) } 
    });

    if (existingPost) {
      return res.status(200).json({
        success: true,
        message: "Service created successfully (Duplicate prevented)", 
        data: existingPost
      });
    }

    const service = await Service.create({
      title,
      description,
      companyName,
      employmentType,
      location,
      education,
      passedOutYear,
      experience,
      salary,
      role,
      keySkills,
      refereedBy,
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
      .populate("memberId", "name email role photoUrl") // Added photoUrl
      .populate("refereedBy", "name email")
      .populate({
        path: "appliedMembers.memberId",
        // 👇 Merged: Added 'resumeLink' and 'photoUrl' here for frontend access
        select: "name email role resumeLink photoUrl", 
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

/* -------------------- GET SINGLE SERVICE -------------------- */
const getSingleServicePost = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("memberId", "name email photoUrl")
      .populate("refereedBy", "name email")
      // 👇 Merged: Added resumeLink and photoUrl here
      .populate("appliedMembers.memberId", "name email role resumeLink photoUrl");

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

    // --- EMAIL NOTIFICATION LOGIC (Merged from File 1) ---
    try {
      const applicant = await Member.findById(memberId);
      if (applicant) {
        const candidateData = {
          name: applicant.name,
          email: applicant.email
        };

        // Send email to Admin
        await sendAdminApplicationNotification(
          "jobbridgekarnataka@gmail.com", // Or fetch dynamic admin email
          candidateData,
          service.title
        );
      }
    } catch (emailError) {
      console.error("Admin notification email failed:", emailError);
    }

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
      .populate("memberId", "name email photoUrl")
      // 👇 Merged: Ensure resumeLink/photoUrl persists in response so UI doesn't break
      .populate("appliedMembers.memberId", "name email role resumeLink photoUrl");

    if (!updatedJob) {
      return res.status(404).json({ message: "Job or Applicant not found" });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedJob
    });

    // --- EMAIL NOTIFICATION LOGIC (Merged from File 1) ---
    try {
      // Find the specific applicant to get their email
      const applicant = updatedJob.appliedMembers.find(
        (a) => String(a.memberId?._id || a.memberId) === String(memberId)
      );

      if (applicant?.memberId?.email) {
        await sendStatusUpdateNotification(
          applicant.memberId.email,
          applicant.memberId.name,
          updatedJob.title,
          status
        );
      }
    } catch (emailError) {
      console.error("Failed to send status update notification:", emailError);
    }

  } catch (error) {
    console.error("updateStatus error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* -------------------- UPDATE SERVICE POST (EDIT JOB) -------------------- */
const updateServicePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, companyName, employmentType, location,
      education, passedOutYear, experience, salary, role, keySkills, refereedBy 
    } = req.body;

    const updatedService = await Service.findByIdAndUpdate(
      id,
      { 
        title, description, companyName, employmentType, location,
        education, passedOutYear, experience, salary, role, keySkills, refereedBy 
      },
      { new: true } 
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


// //--------------------------20/01---------------------------3.19-----

// const Service = require("../models/service");
// const Member = require("../models/member");
// const { 
//   sendJobPostNotification, 
//   sendStatusUpdateNotification, 
//   sendAdminApplicationNotification 
// } = require("../utils/emailService");

// /* -------------------- CREATE SERVICE (ADMIN ONLY) -------------------- */
// const addServicePost = async (req, res) => {
//   try {
//     const { 
//       title, description, companyName, employmentType, location, 
//       education, passedOutYear, experience, salary, role, keySkills, refereedBy 
//     } = req.body;

//     // --- DUPLICATE CHECK ---
//     const existingPost = await Service.findOne({
//       title: title,
//       description: description,
//       createdAt: { $gt: new Date(Date.now() - 60 * 1000) } 
//     });

//     if (existingPost) {
//       return res.status(200).json({
//         success: true,
//         message: "Service created successfully (Duplicate prevented)", 
//         data: existingPost
//       });
//     }

//     // Set memberId if user is logged in (admin)
//     const memberId = req.user?.memberId || null;

//     const service = await Service.create({
//       title,
//       description,
//       companyName,
//       employmentType,
//       location,
//       education,
//       passedOutYear,
//       experience,
//       salary,
//       role,
//       keySkills,
//       refereedBy,
//       memberId,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Service created successfully",
//       data: service
//     });

//   } catch (error) {
//     console.error("addServicePost error:", error);

//     // Handle validation errors
//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: messages
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to create service",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// /* -------------------- GET ALL SERVICES (PUBLIC) -------------------- */
// const getServicePost = async (req, res) => {
//   try {
//     // Optional query parameters for filtering
//     const { 
//       employmentType, 
//       location, 
//       search,
//       status,
//       memberId 
//     } = req.query;

//     let query = {};

//     // Apply filters if provided
//     if (employmentType) {
//       query.employmentType = employmentType;
//     }

//     if (location) {
//       query.location = { $regex: location, $options: 'i' };
//     }

//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: 'i' } },
//         { description: { $regex: search, $options: 'i' } },
//         { companyName: { $regex: search, $options: 'i' } },
//         { role: { $regex: search, $options: 'i' } },
//         { keySkills: { $regex: search, $options: 'i' } }
//       ];
//     }

//     // Filter by status in applied members
//     if (status && memberId) {
//       query["appliedMembers"] = {
//         $elemMatch: {
//           memberId: memberId,
//           status: status
//         }
//       };
//     }

//     const services = await Service.find(query)
//       .populate("memberId", "name email role photoUrl")
//       .populate("refereedBy", "name email")
//       .populate({
//         path: "appliedMembers.memberId",
//         select: "name email role resumeLink photoUrl"
//       })
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: services.length,
//       data: services,
//     });
//   } catch (error) {
//     console.error("getServicePost error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch services",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// /* -------------------- DELETE SERVICE (ADMIN ONLY) -------------------- */
// const deleteServicePost = async (req, res) => {
//   try {
//     // Check if user is admin
//     if (req.user?.role !== "Admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Only admin can delete services",
//       });
//     }

//     const service = await Service.findByIdAndDelete(req.params.id);

//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         message: "Service not found",
//       });
//     }

//     res.json({
//       success: true,
//       message: "Service deleted successfully",
//     });
//   } catch (error) {
//     console.error("deleteServicePost error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete service",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// /* -------------------- GET SINGLE SERVICE -------------------- */
// const getSingleServicePost = async (req, res) => {
//   try {
//     const service = await Service.findById(req.params.id)
//       .populate("memberId", "name email photoUrl")
//       .populate("refereedBy", "name email")
//       .populate("appliedMembers.memberId", "name email role resumeLink photoUrl");

//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         message: "Service not found",
//       });
//     }

//     res.json({
//       success: true,
//       data: service,
//     });
//   } catch (error) {
//     console.error("getSingleServicePost error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch service",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// /* -------------------- APPLY TO SERVICE (MEMBER) -------------------- */
// const applyToService = async (req, res) => {
//   try {
//     const serviceId = req.params.id;
//     const memberId = req.user?.memberId;

//     if (!memberId) {
//       return res.status(401).json({ 
//         success: false, 
//         message: "Authentication required. Please log in." 
//       });
//     }

//     const service = await Service.findById(serviceId);
//     if (!service) {
//       return res.status(404).json({ success: false, message: "Service not found" });
//     }

//     // Check if already applied
//     const alreadyApplied = service.appliedMembers.some(
//       (a) => String(a.memberId) === String(memberId)
//     );

//     if (alreadyApplied) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Already applied to this service" 
//       });
//     }

//     // Get applicant details
//     const applicant = await Member.findById(memberId);
//     if (!applicant) {
//       return res.status(404).json({ 
//         success: false, 
//         message: "Applicant not found" 
//       });
//     }

//     // Use provided resumeLink or fallback to member's profile resume
//     const { resumeLink } = req.body;
//     let finalResumeLink = resumeLink || applicant.resumeLink;

//     // Create application record
//     const application = {
//       memberId,
//       resumeLink: finalResumeLink,
//       status: 'Applied',
//       appliedAt: new Date()
//     };

//     service.appliedMembers.push(application);
//     await service.save();

//     // --- EMAIL NOTIFICATION ---
//     try {
//       const candidateData = {
//         name: applicant.name,
//         email: applicant.email,
//         resumeLink: finalResumeLink
//       };

//       // Send email to Admin
//       await sendAdminApplicationNotification(
//         process.env.ADMIN_EMAIL || "jobbridgekarnataka@gmail.com",
//         candidateData,
//         service.title
//       );

//       // Optionally send confirmation to applicant
//       if (applicant.email) {
//         await sendStatusUpdateNotification(
//           applicant.email,
//           applicant.name,
//           service.title,
//           'Applied'
//         );
//       }
//     } catch (emailError) {
//       console.error("Email notification failed:", emailError);
//       // Don't fail the request if email fails
//     }

//     // Get updated service with populated data
//     const updatedService = await Service.findById(serviceId)
//       .populate("appliedMembers.memberId", "name email role resumeLink photoUrl");

//     res.json({ 
//       success: true, 
//       message: "Application submitted successfully",
//       data: {
//         service: updatedService,
//         application: application
//       }
//     });

//   } catch (error) {
//     console.error("applyToService error:", error);

//     if (error.name === "CastError") {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid service ID" 
//       });
//     }

//     res.status(500).json({ 
//       success: false, 
//       message: "Application failed",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// /* -------------------- UPDATE APPLICATION STATUS (ADMIN) -------------------- */
// const updateStatus = async (req, res) => {
//   try {
//     const { jobId, memberId, status } = req.body;

//     // Validate status
//     const allowedStatuses = ['Applied', 'Review', 'Shortlisted', 'Offer', 'Accepted', 'Rejected'];
//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid status" 
//       });
//     }

//     const updatedJob = await Service.findOneAndUpdate(
//       { _id: jobId, "appliedMembers.memberId": memberId },
//       {
//         $set: { 
//           "appliedMembers.$.status": status,
//           "appliedMembers.$.updatedAt": new Date()
//         }
//       },
//       { new: true }
//     )
//       .populate("memberId", "name email photoUrl")
//       .populate("appliedMembers.memberId", "name email role resumeLink photoUrl");

//     if (!updatedJob) {
//       return res.status(404).json({ 
//         success: false,
//         message: "Job or Applicant not found" 
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: `Status updated to ${status} successfully`,
//       data: updatedJob
//     });

//     // --- EMAIL NOTIFICATION ---
//     try {
//       // Find the specific applicant to get their email
//       const applicant = updatedJob.appliedMembers.find(
//         (a) => String(a.memberId?._id || a.memberId) === String(memberId)
//       );

//       if (applicant?.memberId?.email) {
//         await sendStatusUpdateNotification(
//           applicant.memberId.email,
//           applicant.memberId.name,
//           updatedJob.title,
//           status
//         );
//       }
//     } catch (emailError) {
//       console.error("Failed to send status update notification:", emailError);
//     }

//   } catch (error) {
//     console.error("updateStatus error:", error);

//     if (error.name === "CastError") {
//       return res.status(400).json({ 
//         success: false, 
//         message: "Invalid job ID or member ID" 
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to update status",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// /* -------------------- UPDATE SERVICE POST (EDIT JOB) -------------------- */
// const updateServicePost = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { 
//       title, description, companyName, employmentType, location,
//       education, passedOutYear, experience, salary, role, keySkills, refereedBy 
//     } = req.body;

//     // Check if user is admin or the original poster
//     const existingService = await Service.findById(id);
//     if (!existingService) {
//       return res.status(404).json({
//         success: false,
//         message: "Service post not found",
//       });
//     }

//     // Authorization check (admin or original poster)
//     if (req.user?.role !== "Admin" && 
//         String(existingService.memberId) !== String(req.user?.memberId)) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized to update this service",
//       });
//     }

//     const updatedService = await Service.findByIdAndUpdate(
//       id,
//       { 
//         title, description, companyName, employmentType, location,
//         education, passedOutYear, experience, salary, role, keySkills, refereedBy,
//         updatedAt: new Date()
//       },
//       { new: true, runValidators: true }
//     )
//       .populate("memberId", "name email photoUrl")
//       .populate("refereedBy", "name email");

//     res.status(200).json({
//       success: true,
//       message: "Service updated successfully",
//       data: updatedService,
//     });
//   } catch (error) {
//     console.error("updateServicePost error:", error);

//     if (error.name === "ValidationError") {
//       const messages = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: messages
//       });
//     }

//     if (error.name === "CastError") {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid service ID",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to update service",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// /* -------------------- GET APPLICATIONS FOR A SERVICE (ADMIN) -------------------- */
// const getServiceApplications = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if user is admin
//     if (req.user?.role !== "Admin") {
//       return res.status(403).json({
//         success: false,
//         message: "Only admin can view applications",
//       });
//     }

//     const service = await Service.findById(id)
//       .populate({
//         path: "appliedMembers.memberId",
//         select: "name email phone mobileNumber role photoUrl resumeLink experience skills"
//       })
//       .select("title appliedMembers");

//     if (!service) {
//       return res.status(404).json({
//         success: false,
//         message: "Service not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: {
//         serviceTitle: service.title,
//         applications: service.appliedMembers,
//         totalApplications: service.appliedMembers.length
//       }
//     });
//   } catch (error) {
//     console.error("getServiceApplications error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch applications",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// /* -------------------- BULK CREATE SERVICES (ADMIN) -------------------- */
// const bulkCreateServices = async (req, res) => {
//   try {
//     const servicesData = req.body;

//     if (!Array.isArray(servicesData) || servicesData.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Please provide an array of service data"
//       });
//     }

//     // Add memberId to each service
//     const memberId = req.user?.memberId;
//     const servicesWithMemberId = servicesData.map(service => ({
//       ...service,
//       memberId
//     }));

//     const createdServices = await Service.insertMany(servicesWithMemberId);

//     res.status(201).json({
//       success: true,
//       message: `Successfully created ${createdServices.length} services`,
//       data: createdServices
//     });
//   } catch (error) {
//     console.error("bulkCreateServices error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create services in bulk",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// module.exports = {
//   addServicePost,
//   getServicePost,
//   deleteServicePost,
//   getSingleServicePost,
//   applyToService,
//   updateStatus,
//   updateServicePost,
//   getServiceApplications,
//   bulkCreateServices
// };

//--------------------------20/01---------------------------3.19-----

const Service = require("../models/service");
const Member = require("../models/member");
const {
  sendJobPostNotification,
  sendStatusUpdateNotification,
  sendAdminApplicationNotification
} = require("../utils/emailService");

// Helper function to generate Job ID in YYMMXXX format
const generateJobId = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Get last 2 digits of year
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Get month as 01-12
    const yearMonth = year + month;

    // Find the latest job created (regardless of month) to get global sequence
    const lastJob = await Service.findOne({})
      .sort({ createdAt: -1 })
      .select("jobId");

    let sequenceNumber = 1;
    if (lastJob && lastJob.jobId) {
      const lastNumber = parseInt(lastJob.jobId.slice(-4)); // Get last 4 digits
      sequenceNumber = lastNumber + 1;
    }

    const jobId = yearMonth + String(sequenceNumber).padStart(4, '0');
    return jobId;
  } catch (error) {
    console.error("Error generating job ID:", error);
    throw error;
  }
};

/* -------------------- CREATE SERVICE (ADMIN ONLY) -------------------- */
const addServicePost = async (req, res) => {
  try {
    const {
      title, description, companyName, employmentType, location,
      education, passedOutYear, experience, salary, role, keySkills, refereedBy, jobPosted
    } = req.body;

    // Validate that at least one of refereedBy or jobPosted is provided
    if (!refereedBy && !jobPosted) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: ["Either 'Refereed Person' or 'Job Posted By (Recruiter)' is required."]
      });
    }

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

    // Set memberId if user is logged in (admin)
    const memberId = req.user?.memberId || null;

    // Generate unique job ID
    const jobId = await generateJobId();

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
      jobPosted,
      memberId,
      jobId,
    });

    const populatedService = await Service.findById(service._id)
      .populate("memberId", "name email photoUrl")
      .populate("refereedBy", "name email")
      .populate("jobPosted", "fullName email");

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: populatedService
    });

  } catch (error) {
    console.error("addServicePost error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create service",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------- GET ALL SERVICES (PUBLIC) -------------------- */
const getServicePost = async (req, res) => {
  try {
    // Optional query parameters for filtering
    const {
      employmentType,
      location,
      search,
      status,
      memberId
    } = req.query;

    let query = {};

    // Apply filters if provided
    if (employmentType) {
      query.employmentType = employmentType;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { keySkills: { $regex: search, $options: 'i' } },
        { jobId: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status in applied members
    if (status && memberId) {
      query["appliedMembers"] = {
        $elemMatch: {
          memberId: memberId,
          status: status
        }
      };
    }

    const services = await Service.find(query)
      .populate("memberId", "name email role photoUrl")
      .populate("refereedBy", "name email")
      .populate("jobPosted", "fullName email")
      .populate({
        path: "appliedMembers.memberId",
        select: "name email role resumeLink photoUrl"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    console.error("getServicePost error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch services",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------- DELETE SERVICE (ADMIN ONLY) -------------------- */
const deleteServicePost = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "Admin") {
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
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------- GET SINGLE SERVICE -------------------- */
const getSingleServicePost = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate("memberId", "name email photoUrl")
      .populate("refereedBy", "name email")
      .populate("jobPosted", "fullName email")
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
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------- APPLY TO SERVICE (MEMBER) -------------------- */
const applyToService = async (req, res) => {
  try {
    console.log('=== APPLY JOB REQUEST START ===');
    console.log('Service ID:', req.params.id);
    console.log('User from token:', req.user);
    console.log('Request Body:', req.body);

    const serviceId = req.params.id;
    let applicantMemberId = req.user?.memberId; // This is the APPLICANT's memberId

    // JWT may be stale (issued before profile setup) — fall back to DB lookup
    if (!applicantMemberId && req.user?.userId) {
      const LoginUser = require("../models/login");
      const loginDoc = await LoginUser.findById(req.user.userId).select("memberId");
      applicantMemberId = loginDoc?.memberId;
    }

    if (!applicantMemberId) {
      console.log('No memberId found in token or DB');
      return res.status(401).json({
        success: false,
        message: "Please complete your profile setup before applying."
      });
    }

    console.log('Looking for service:', serviceId);
    const service = await Service.findById(serviceId);
    if (!service) {
      console.log('Service not found');
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Check if service has a memberId (job poster) - fix validation issue
    if (!service.memberId) {
      console.log('⚠️ Service has no job poster (memberId). This job may have been created without a poster.');
      // We'll allow the application to proceed even without a job poster
      // The validation error will be handled in the save operation
    }

    // Check if already applied
    const alreadyApplied = service.appliedMembers.some(
      (a) => String(a.memberId) === String(applicantMemberId)
    );

    if (alreadyApplied) {
      console.log('Member already applied');
      return res.status(400).json({
        success: false,
        message: "Already applied to this service"
      });
    }

    // Get applicant details
    console.log('Looking for member:', applicantMemberId);
    const applicant = await Member.findById(applicantMemberId);
    if (!applicant) {
      console.log('Applicant not found');
      return res.status(404).json({
        success: false,
        message: "Applicant not found"
      });
    }

    console.log('Applicant found:', {
      name: applicant.name,
      email: applicant.email,
      hasResume: !!applicant.resumeLink
    });

    // Use provided resumeLink or fallback to member's profile resume
    const { resumeLink } = req.body;
    let finalResumeLink = resumeLink || applicant.resumeLink || '';

    console.log('Resume link to use:', finalResumeLink);

    // Create application record
    const application = {
      memberId: applicantMemberId,
      resumeLink: finalResumeLink,
      status: 'Applied',
      appliedAt: new Date()
    };

    console.log('Adding application to service:', application);

    try {
      service.appliedMembers.push(application);
      await service.save();
      console.log('Service saved successfully');
    } catch (saveError) {
      console.error('Error saving service:', saveError);

      // Handle specific case where memberId is missing but required
      if (saveError.name === 'ValidationError' && saveError.message.includes('memberId')) {
        console.log('Attempting to fix missing memberId validation issue...');

        // Try to add a default memberId if missing
        if (!service.memberId) {
          // Check if there's a default admin in the system
          const defaultAdmin = await Member.findOne({ role: 'Admin' }).select('_id');
          if (defaultAdmin) {
            service.memberId = defaultAdmin._id;
            console.log('Assigned default admin as job poster:', defaultAdmin._id);
          } else {
            // Use the applicant as the poster (fallback)
            service.memberId = applicantMemberId;
            console.log('Assigned applicant as job poster (fallback):', applicantMemberId);
          }

          // Try saving again
          try {
            await service.save();
            console.log('Service saved successfully after fixing memberId');
          } catch (retryError) {
            console.error('Still failed to save after fixing memberId:', retryError);
            throw retryError;
          }
        }
      } else {
        throw saveError;
      }
    }

    // --- EMAIL NOTIFICATION ---
    try {
      const candidateData = {
        name: applicant.name || 'Applicant',
        email: applicant.email || 'No email provided',
        resumeLink: finalResumeLink
      };

      console.log('Candidate data for email:', candidateData);

      // Send email to Admin only if admin email is configured
      const adminEmail = process.env.ADMIN_EMAIL || "jobbridgekarnataka@gmail.com";
      if (adminEmail) {
        console.log('Sending email to admin:', adminEmail);
        await sendAdminApplicationNotification(
          adminEmail,
          candidateData,
          service.title
        );
        console.log('Admin email sent');
      } else {
        console.log('No admin email configured');
      }

      // Optionally send confirmation to applicant (only if they have email)
      if (applicant.email) {
        console.log('Sending confirmation to applicant:', applicant.email);
        await sendStatusUpdateNotification(
          applicant.email,
          applicant.name || 'Applicant',
          service.title,
          'Applied'
        );
        console.log('Applicant email sent');
      } else {
        console.log('No applicant email available for confirmation');
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
      // Don't fail the request if email fails
    }

    // Get updated service with populated data
    const updatedService = await Service.findById(serviceId)
      .populate("memberId", "name email role photoUrl")
      .populate("refereedBy", "name email")
      .populate("appliedMembers.memberId", "name email role resumeLink photoUrl");

    console.log('=== APPLY JOB REQUEST COMPLETE ===');

    res.json({
      success: true,
      message: "Application submitted successfully",
      data: {
        service: updatedService,
        application: application
      }
    });

  } catch (error) {
    console.error("applyToService error details:");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID"
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: "Application failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------- UPDATE APPLICATION STATUS (ADMIN) -------------------- */
const updateStatus = async (req, res) => {
  try {
    const { jobId, memberId, status } = req.body;

    // Validate status
    const allowedStatuses = ['Applied', 'Review', 'Shortlisted', 'Offer', 'Accepted', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const updatedJob = await Service.findOneAndUpdate(
      { _id: jobId, "appliedMembers.memberId": memberId },
      {
        $set: {
          "appliedMembers.$.status": status,
          "appliedMembers.$.updatedAt": new Date()
        }
      },
      { new: true }
    )
      .populate("memberId", "name email photoUrl")
      .populate("appliedMembers.memberId", "name email role resumeLink photoUrl");

    if (!updatedJob) {
      return res.status(404).json({
        success: false,
        message: "Job or Applicant not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Status updated to ${status} successfully`,
      data: updatedJob
    });

    // --- EMAIL NOTIFICATION ---
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

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID or member ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------- UPDATE SERVICE POST (EDIT JOB) -------------------- */
const updateServicePost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, companyName, employmentType, location,
      education, passedOutYear, experience, salary, role, keySkills, refereedBy, jobPosted
    } = req.body;

    // Check if user is admin or the original poster
    const existingService = await Service.findById(id);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service post not found",
      });
    }

    // Authorization check (admin or original poster)
    if (req.user?.role !== "Admin" &&
      String(existingService.memberId) !== String(req.user?.memberId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this service",
      });
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        title, description, companyName, employmentType, location,
        education, passedOutYear, experience, salary, role, keySkills, refereedBy, jobPosted,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )
      .populate("memberId", "name email photoUrl")
      .populate("refereedBy", "name email")
      .populate("jobPosted", "fullName email");

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    });
  } catch (error) {
    console.error("updateServicePost error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid service ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update service",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------- GET APPLICATIONS FOR A SERVICE (ADMIN) -------------------- */
const getServiceApplications = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (req.user?.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can view applications",
      });
    }

    const service = await Service.findById(id)
      .populate({
        path: "appliedMembers.memberId",
        select: "name email phone mobileNumber role photoUrl resumeLink experience skills"
      })
      .select("title appliedMembers");

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        serviceTitle: service.title,
        applications: service.appliedMembers,
        totalApplications: service.appliedMembers.length
      }
    });
  } catch (error) {
    console.error("getServiceApplications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------- BULK CREATE SERVICES (ADMIN) -------------------- */
const bulkCreateServices = async (req, res) => {
  try {
    const servicesData = req.body;

    if (!Array.isArray(servicesData) || servicesData.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of service data"
      });
    }

    // Add memberId to each service
    const memberId = req.user?.memberId;
    const servicesWithMemberId = servicesData.map(service => ({
      ...service,
      memberId
    }));

    const createdServices = await Service.insertMany(servicesWithMemberId);

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdServices.length} services`,
      data: createdServices
    });
  } catch (error) {
    console.error("bulkCreateServices error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create services in bulk",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------- GET UNLINKED JOBS (No refereedBy set) -------------------- */
const getUnlinkedJobs = async (req, res) => {
  try {
    // Find all services that don't have a refereedBy
    const unlinkedJobs = await Service.find({
      $or: [
        { refereedBy: null },
        { refereedBy: { $exists: false } }
      ]
    })
    .populate('memberId', 'name email')
    .populate('jobPosted', 'fullName email')
    .sort({ createdAt: -1 })
    .limit(100);

    res.status(200).json({
      success: true,
      count: unlinkedJobs.length,
      message: `Found ${unlinkedJobs.length} jobs without a referee link`,
      data: unlinkedJobs
    });

  } catch (error) {
    console.error("getUnlinkedJobs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch unlinked jobs",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* -------------------- LINK/ASSIGN A REFEREE TO A JOB -------------------- */
const linkJobToReferee = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { refereeId } = req.body;

    if (!refereeId) {
      return res.status(400).json({
        success: false,
        message: "Referee ID is required"
      });
    }

    // Update the service with the refereeId
    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      { refereedBy: refereeId },
      { new: true }
    ).populate('refereedBy', 'name email')
     .populate('memberId', 'name email')
     .populate('jobPosted', 'fullName email');

    if (!updatedService) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Job successfully linked to referee",
      data: updatedService
    });

  } catch (error) {
    console.error("linkJobToReferee error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to link job to referee",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
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
  updateServicePost,
  getServiceApplications,
  bulkCreateServices,
  linkJobToReferee,
  getUnlinkedJobs
};
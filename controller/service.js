const Service = require("../models/service");
const Member = require("../models/member");
const {
  sendJobPostNotification,
  sendStatusUpdateNotification,
  sendAdminApplicationNotification
} = require("../utils/emailService");
const { triggerNotification } = require("../utils/notificationHelper");

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

// Helper function to sync job active status based on applicationEndDate
const syncJobStatuses = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update jobs whose end date has passed to be inactive
    await Service.updateMany(
      {
        isActive: true,
        applicationEndDate: { $lte: today }
      },
      {
        $set: { isActive: false }
      }
    );

    // Update jobs whose end date is in the future to be active
    await Service.updateMany(
      {
        isActive: false,
        applicationEndDate: { $gt: today }
      },
      {
        $set: { isActive: true }
      }
    );
  } catch (error) {
    console.error("Error syncing job statuses:", error);
  }
};

/* -------------------- CREATE SERVICE (ADMIN ONLY) -------------------- */
const addServicePost = async (req, res) => {
  try {
    const {
      title, description, companyName, companyLogo, employmentType, location,
      education, passedOutYear, experience, salary, role, keySkills, refereedBy, jobPosted, industry,
      applicationEndDate
    } = req.body;

    const normalizedEmploymentType = normalizeEmploymentType(employmentType);

    // Validate that at least one of refereedBy or jobPosted is provided
    if (!refereedBy && !jobPosted) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: ["Either 'Refereed Person' or 'Job Posted By (Recruiter)' is required."]
      });
    }

    if (applicationEndDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(applicationEndDate);
      selectedDate.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        return res.status(400).json({
          success: false,
          message: "Application End Date cannot be in the past."
        });
      }
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
      companyLogo,
      employmentType: normalizedEmploymentType,
      location,
      industry,
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
      applicationEndDate,
    });

    const populatedService = await Service.findById(service._id)
      .populate("memberId", "name email photoUrl")
      .populate("refereedBy", "name email")
      .populate("jobPosted", "fullName email");

    // --- NOTIFICATIONS WORKFLOW TRIGGER ---
    try {
      await triggerNotification({
        type: "new_job_post",
        recipientId: null, // Broadcast to all candidates
        title: "New Job Posted",
        message: `A new job "${title}" at "${companyName || 'Verified Employer'}" has been posted.`,
        relatedId: service._id,
        relatedModel: "Service",
        data: {
          jobTitle: title,
          companyName: companyName,
          location: location
        }
      });
    } catch (notificationError) {
      console.error("Failed to trigger new job post notification:", notificationError);
    }

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
      memberId,
      isActive
    } = req.query;

    await syncJobStatuses();

    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

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
        select: "name email role resumeLink photoUrl mobileNumber highest_education highestEducationSpecialization careerProfile workExp district address"
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
    await syncJobStatuses();
    const service = await Service.findById(req.params.id)
      .populate("memberId", "name email photoUrl")
      .populate("refereedBy", "name email")
      .populate("jobPosted", "fullName email")
      .populate("appliedMembers.memberId", "name email role resumeLink photoUrl mobileNumber highest_education highestEducationSpecialization careerProfile workExp district address");

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
    let applicantMemberId = req.user?.memberId || req.user?.userId || req.user?.id || req.user?._id;

    // JWT may be stale (issued before profile setup) — fall back to DB lookup
    if (!applicantMemberId && req.user?.userId) {
      const LoginUser = require("../models/login");
      const loginDoc = await LoginUser.findById(req.user.userId).select("memberId");
      applicantMemberId = loginDoc?.memberId;
    }

    if (!applicantMemberId && req.user?.email) {
      const Candidate = require("../models/candidate");
      const existing = (await Member.findOne({ email: req.user.email })) || (await Candidate.findOne({ email: req.user.email }));
      if (existing) applicantMemberId = existing._id;
    }

    if (!applicantMemberId) {
      console.log('No memberId found in token or DB');
      return res.status(401).json({
        success: false,
        message: "Please complete your profile setup before applying."
      });
    }

    await syncJobStatuses();
    console.log('Looking for service:', serviceId);
    const service = await Service.findById(serviceId);
    if (!service) {
      console.log('Service not found');
      return res.status(404).json({ success: false, message: "Service not found" });
    }

    // Check if Application End Date is reached (on and after) or if job is marked inactive
    if (service.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "Application Closed"
      });
    }

    if (service.applicationEndDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(service.applicationEndDate);
      endDate.setHours(0, 0, 0, 0);
      if (today >= endDate) {
        return res.status(400).json({
          success: false,
          message: "Application Closed"
        });
      }
    }

    // Check if service has a memberId (job poster) - fix validation issue
    if (!service.memberId) {
      console.log('⚠️ Service has no job poster (memberId). This job may have been created without a poster.');
      // We'll allow the application to proceed even without a job poster
      // The validation error will be handled in the save operation
    }

    // Get applicant details
    console.log('Looking for member:', applicantMemberId);
    let applicant = await Member.findById(applicantMemberId);
    if (!applicant) {
      const Candidate = require("../models/candidate");
      applicant = await Candidate.findById(applicantMemberId);
    }
    if (!applicant && req.user?.email) {
      const Candidate = require("../models/candidate");
      applicant = (await Member.findOne({ email: req.user.email })) || (await Candidate.findOne({ email: req.user.email }));
    }
    if (!applicant) {
      console.log('Applicant not found');
      return res.status(404).json({
        success: false,
        message: "Applicant profile not found. Please complete your profile setup first."
      });
    }
    applicantMemberId = applicant._id;

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

    // --- NOTIFICATIONS WORKFLOW TRIGGER ---
    try {
      // 1. Trigger Candidate Submission Confirmation
      await triggerNotification({
        type: "submission_confirmation",
        recipientId: req.user?.userId,
        title: "Application Submitted",
        message: `Your application for "${service.title}" has been successfully submitted.`,
        relatedId: service._id,
        relatedModel: "Service",
        data: {
          jobTitle: service.title
        }
      });

      // 2. Trigger Admin New Application Alert
      await triggerNotification({
        type: "new_application",
        recipientId: null, // Broadcast to role Admin
        title: "New Application Received",
        message: `Candidate "${applicant.name || 'Applicant'}" has applied for "${service.title}".`,
        relatedId: service._id,
        relatedModel: "Service",
        data: {
          candidateName: applicant.name || 'Applicant',
          candidateEmail: applicant.email || 'No email provided',
          jobTitle: service.title
        }
      });
    } catch (notificationError) {
      console.error("Notification trigger failed:", notificationError);
    }

    // Get updated service with populated data
    const updatedService = await Service.findById(serviceId)
      .populate("memberId", "name email role photoUrl")
      .populate("refereedBy", "name email")
      .populate("appliedMembers.memberId", "name email role resumeLink photoUrl mobileNumber highest_education highestEducationSpecialization careerProfile workExp district address");

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
      .populate("appliedMembers.memberId", "name email role resumeLink photoUrl mobileNumber highest_education highestEducationSpecialization careerProfile workExp district address");

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

    // --- NOTIFICATIONS WORKFLOW TRIGGER ---
    try {
      const LoginUser = require("../models/login");
      // Find the user associated with this member
      const user = await LoginUser.findOne({ memberId: memberId });
      
      if (user) {
        const isInterview = status === "Shortlisted";
        
        await triggerNotification({
          type: isInterview ? "interview_notification" : "status_update",
          recipientId: user._id,
          title: isInterview ? "Interview Scheduled" : "Application Status Update",
          message: isInterview
            ? `You have been scheduled for an interview for the job post "${updatedJob.title}".`
            : `Your application status for "${updatedJob.title}" has been updated to "${status}".`,
          relatedId: updatedJob._id,
          relatedModel: "Service",
          data: {
            jobTitle: updatedJob.title,
            newStatus: status
          }
        });
      }
    } catch (notificationError) {
      console.error("Failed to trigger status update notification:", notificationError);
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
      title, description, companyName, companyLogo, employmentType, location,
      education, passedOutYear, experience, salary, role, keySkills, refereedBy, jobPosted, industry,
      applicationEndDate
    } = req.body;

    // Check if user is admin or the original poster
    const existingService = await Service.findById(id);
    if (!existingService) {
      return res.status(404).json({
        success: false,
        message: "Service post not found",
      });
    }

    if (applicationEndDate) {
      const newDate = new Date(applicationEndDate);
      newDate.setHours(0, 0, 0, 0);
      
      const oldDate = existingService.applicationEndDate ? new Date(existingService.applicationEndDate) : null;
      if (oldDate) oldDate.setHours(0, 0, 0, 0);
      
      if (!oldDate || newDate.getTime() !== oldDate.getTime()) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (newDate < today) {
          return res.status(400).json({
            success: false,
            message: "Application End Date cannot be in the past."
          });
        }
      }
    }

    // Authorization check (admin or original poster)
    if (req.user?.role !== "Admin" &&
      String(existingService.memberId) !== String(req.user?.memberId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this service",
      });
    }

    let isActive = undefined;
    if (applicationEndDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(applicationEndDate);
      selectedDate.setHours(0, 0, 0, 0);
      isActive = today < selectedDate;
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        title, description, companyName, companyLogo, employmentType, location, industry,
        education, passedOutYear, experience, salary, role, keySkills, refereedBy, jobPosted,
        applicationEndDate,
        ...(isActive !== undefined ? { isActive } : {}),
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
        select: "name email phone mobileNumber role photoUrl resumeLink experience skills highest_education highestEducationSpecialization careerProfile workExp district address"
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

    const memberId = req.user?.memberId || null;
    const createdServices = [];

    for (const serviceData of servicesData) {
      // Validate each job matches the mandatory selection rule
      if (!serviceData.refereedBy && !serviceData.jobPosted) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: [`Job "${serviceData.title || "Untitled"}" requires either a 'Refereed Person' or 'Job Posted By (Recruiter)'.`]
        });
      }

      // Generate Job ID using the standard method
      // sequential calls in a loop are safe because each one waits for the previous save
      const jobId = await generateJobId();

      const resolvedEndDate = serviceData.applicationEndDate ? new Date(serviceData.applicationEndDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tempEndDate = new Date(resolvedEndDate);
      tempEndDate.setHours(0, 0, 0, 0);
      const isActive = today < tempEndDate;

      // Create service
      const service = await Service.create({
        ...serviceData,
        memberId,
        employmentType: normalizeEmploymentType(serviceData.employmentType),
        jobId,
        refereedBy: serviceData.refereedBy || null,
        jobPosted: serviceData.jobPosted || null,
        applicationEndDate: resolvedEndDate,
        isActive
      });

      createdServices.push(service);
    }

    // --- NOTIFICATIONS WORKFLOW TRIGGER ---
    try {
      if (createdServices.length > 0) {
        const jobsCount = createdServices.length;
        const mainJob = createdServices[0];
        await triggerNotification({
          type: "new_job_post",
          recipientId: null, // Broadcast to all candidates
          title: "New Jobs Posted",
          message: jobsCount === 1 
            ? `A new job "${mainJob.title}" has been posted.`
            : `${jobsCount} new jobs have been posted, including "${mainJob.title}".`,
          relatedId: mainJob._id,
          relatedModel: "Service",
          data: {
            jobTitle: jobsCount === 1 ? mainJob.title : `${jobsCount} New Jobs`,
            companyName: mainJob.companyName || "Multiple Companies"
          }
        });
      }
    } catch (notificationError) {
      console.error("Failed to trigger bulk new job post notification:", notificationError);
    }

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
    await syncJobStatuses();
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

const normalizeEmploymentType = (type) => {
  if (!type) return "Full-time";
  const t = type.toLowerCase().replace(/[^a-z-]/g, "");
  if (t === "full-time" || t === "fulltime") return "Full-time";
  if (t === "part-time" || t === "parttime") return "Part-time";
  if (t === "internship") return "Internship";
  if (t === "remote") return "Remote";
  if (t === "contract") return "Contract";
  if (t === "freelance") return "Freelance";
  return "Full-time";
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
const Job = require("../models/job");
const Member = require("../models/member");
const Recruiter = require("../models/Recruiter");
const {
  sendJobPostNotification,
  sendStatusUpdateNotification,
  sendAdminApplicationNotification
} = require("../utils/emailService");
const { triggerNotification } = require("../utils/notificationHelper");
const { processJobMatchAndNotify } = require("../services/jobNotificationService");

// Helper function to generate Job ID in YYMMXXX format
const generateJobId = async () => {
  try {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Get last 2 digits of year
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Get month as 01-12
    const yearMonth = year + month;

    // Find the latest job created (regardless of month) to get global sequence
    const lastJob = await Job.findOne({})
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
    await Job.updateMany(
      {
        isActive: true,
        applicationEndDate: { $lte: today }
      },
      {
        $set: { isActive: false }
      }
    );

    // Update jobs whose end date is in the future to be active
    await Job.updateMany(
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

/* -------------------- CREATE SERVICE / JOB (ADMIN ONLY) -------------------- */
const addServicePost = async (req, res) => {
  try {
    const {
      title, description, companyName, companyLogo, employmentType, location,
      education, passedOutYear, experience, salary, role, keySkills, refereedBy, jobPosted, industry,
      applicationEndDate
    } = req.body;

    const normalizedEmploymentType = normalizeEmploymentType(employmentType);

    // Validate that role and keySkills are provided
    if (!role || !String(role).trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: ["'Job Role' is required."]
      });
    }

    if (!keySkills || !String(keySkills).trim()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: ["'Key Skills' is required."]
      });
    }

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
    const existingPost = await Job.findOne({
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

    const service = await Job.create({
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

    const populatedService = await Job.findById(service._id)
      .populate("memberId", "name email photoUrl")
      .populate("refereedBy", "name email")
      .populate("jobPosted", "fullName email");

    // --- TRIGGER DYNAMIC RELEVANT JOB SEEKER EMAIL NOTIFICATIONS ---
    processJobMatchAndNotify(service._id).catch((err) => {
      console.error("[jobController] Background job notification error:", err);
    });

    // --- IN-APP NOTIFICATIONS WORKFLOW TRIGGER ---
    try {
      await triggerNotification({
        type: "new_job_post",
        recipientId: null,
        title: "New Job Posted",
        message: `A new job "${title}" at "${companyName || 'Verified Employer'}" has been posted.`,
        relatedId: service._id,
        relatedModel: "Job",
        data: {
          jobTitle: title,
          companyName: companyName,
          location: location
        }
      });
    } catch (notificationError) {
      console.error("Failed to trigger in-app job post notification:", notificationError);
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

/* -------------------- GET ALL SERVICES / JOBS (PUBLIC) -------------------- */
const getServicePost = async (req, res) => {
  try {
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

    if (status && memberId) {
      query["appliedMembers"] = {
        $elemMatch: {
          memberId: memberId,
          status: status
        }
      };
    }

    const services = await Job.find(query)
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

/* -------------------- DELETE SERVICE / JOB (ADMIN ONLY) -------------------- */
const deleteServicePost = async (req, res) => {
  try {
    if (req.user?.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can delete services",
      });
    }

    const service = await Job.findByIdAndDelete(req.params.id);

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

/* -------------------- GET SINGLE SERVICE / JOB -------------------- */
const getSingleServicePost = async (req, res) => {
  try {
    await syncJobStatuses();
    const service = await Job.findById(req.params.id)
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

/* -------------------- APPLY TO SERVICE / JOB (MEMBER) -------------------- */
const applyToService = async (req, res) => {
  try {
    const serviceId = req.params.id;
    let applicantMemberId = req.user?.memberId || req.user?.userId || req.user?.id || req.user?._id;

    if (!applicantMemberId && req.user?.userId) {
      const LoginUser = require("../models/login");
      const GoogleUser = require("../models/googleUser");
      const loginDoc = (await LoginUser.findById(req.user.userId).select("memberId")) || (await GoogleUser.findById(req.user.userId).select("memberId"));
      applicantMemberId = loginDoc?.memberId;
    }

    if (!applicantMemberId && req.user?.email) {
      const Candidate = require("../models/candidate");
      const existing = (await Member.findOne({ email: req.user.email })) || (await Candidate.findOne({ email: req.user.email }));
      if (existing) applicantMemberId = existing._id;
    }

    if (!applicantMemberId) {
      return res.status(401).json({
        success: false,
        message: "Please complete your profile setup before applying."
      });
    }

    await syncJobStatuses();
    const service = await Job.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }

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
      return res.status(404).json({
        success: false,
        message: "Applicant profile not found. Please complete your profile setup first."
      });
    }
    applicantMemberId = applicant._id;

    const alreadyApplied = service.appliedMembers.some(
      (a) => String(a.memberId) === String(applicantMemberId)
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: "Already applied to this service"
      });
    }

    const { resumeLink } = req.body;
    let finalResumeLink = resumeLink || applicant.resumeLink || '';

    const application = {
      memberId: applicantMemberId,
      resumeLink: finalResumeLink,
      status: 'Applied',
      appliedAt: new Date()
    };

    try {
      service.appliedMembers.push(application);
      await service.save();
    } catch (saveError) {
      if (saveError.name === 'ValidationError' && saveError.message.includes('memberId')) {
        if (!service.memberId) {
          const defaultAdmin = await Member.findOne({ role: 'Admin' }).select('_id');
          if (defaultAdmin) {
            service.memberId = defaultAdmin._id;
          } else {
            service.memberId = applicantMemberId;
          }
          await service.save();
        }
      } else {
        throw saveError;
      }
    }

    try {
      await triggerNotification({
        type: "submission_confirmation",
        recipientId: req.user?.userId,
        title: "Application Submitted",
        message: `Your application for "${service.title}" has been successfully submitted.`,
        relatedId: service._id,
        relatedModel: "Job",
        data: {
          jobTitle: service.title
        }
      });

      await triggerNotification({
        type: "new_application",
        recipientId: null,
        title: "New Application Received",
        message: `Candidate "${applicant.name || 'Applicant'}" has applied for "${service.title}".`,
        relatedId: service._id,
        relatedModel: "Job",
        data: {
          candidateName: applicant.name || 'Applicant',
          candidateEmail: applicant.email || 'No email provided',
          jobTitle: service.title
        }
      });
    } catch (notificationError) {
      console.error("Notification trigger failed:", notificationError);
    }

    const updatedService = await Job.findById(serviceId)
      .populate("memberId", "name email role photoUrl")
      .populate("refereedBy", "name email")
      .populate("appliedMembers.memberId", "name email role resumeLink photoUrl mobileNumber highest_education highestEducationSpecialization careerProfile workExp district address");

    res.json({
      success: true,
      message: "Application submitted successfully",
      data: {
        service: updatedService,
        application: application
      }
    });

  } catch (error) {
    console.error("applyToService error:", error);

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

    const allowedStatuses = ['Applied', 'Review', 'Shortlisted', 'Offer', 'Accepted', 'Rejected'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const updatedJob = await Job.findOneAndUpdate(
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

    try {
      const LoginUser = require("../models/login");
      const GoogleUser = require("../models/googleUser");
      const user = (await LoginUser.findOne({ memberId: memberId })) || (await GoogleUser.findOne({ memberId: memberId }));
      
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
          relatedModel: "Job",
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

/* -------------------- UPDATE SERVICE / JOB POST (EDIT JOB) -------------------- */
const updateServicePost = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, companyName, companyLogo, employmentType, location,
      education, passedOutYear, experience, salary, role, keySkills, refereedBy, jobPosted, industry,
      applicationEndDate
    } = req.body;

    const existingService = await Job.findById(id);
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

    const updatedService = await Job.findByIdAndUpdate(
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

/* -------------------- GET APPLICATIONS FOR A SERVICE / JOB (ADMIN) -------------------- */
const getServiceApplications = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can view applications",
      });
    }

    const service = await Job.findById(id)
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

/* -------------------- BULK CREATE SERVICES / JOBS (ADMIN) -------------------- */
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
      if (!serviceData.refereedBy && !serviceData.jobPosted) {
        return res.status(400).json({
          success: false,
          message: "Validation Error",
          errors: [`Job "${serviceData.title || "Untitled"}" requires either a 'Refereed Person' or 'Job Posted By (Recruiter)'.`]
        });
      }

      const jobId = await generateJobId();

      const resolvedEndDate = serviceData.applicationEndDate ? new Date(serviceData.applicationEndDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tempEndDate = new Date(resolvedEndDate);
      tempEndDate.setHours(0, 0, 0, 0);
      const isActive = today < tempEndDate;

      const service = await Job.create({
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

    // Trigger dynamic notifications for each created job in bulk
    for (const createdJob of createdServices) {
      processJobMatchAndNotify(createdJob._id).catch((err) => {
        console.error(`[jobController] Bulk notification error for ${createdJob._id}:`, err);
      });
    }

    try {
      if (createdServices.length > 0) {
        const jobsCount = createdServices.length;
        const mainJob = createdServices[0];
        await triggerNotification({
          type: "new_job_post",
          recipientId: null,
          title: "New Jobs Posted",
          message: jobsCount === 1 
            ? `A new job "${mainJob.title}" has been posted.`
            : `${jobsCount} new jobs have been posted, including "${mainJob.title}".`,
          relatedId: mainJob._id,
          relatedModel: "Job",
          data: {
            jobTitle: jobsCount === 1 ? mainJob.title : `${jobsCount} New Jobs`,
            companyName: mainJob.companyName || "Multiple Companies"
          }
        });
      }
    } catch (notificationError) {
      console.error("Failed to trigger bulk in-app notification:", notificationError);
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
    const unlinkedJobs = await Job.find({
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

    const updatedService = await Job.findByIdAndUpdate(
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

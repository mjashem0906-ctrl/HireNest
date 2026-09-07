const mongoose = require('mongoose');
require('./member');
require('./Recruiter');

const jobSchema = new mongoose.Schema({
    // --- Job Details ---
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required'],
        trim: true
    },
    companyName: {
        type: String,
        default: "",
        trim: true
    },
    companyLogo: {
        type: String,
        default: "",
        trim: true
    },
    employmentType: {
        type: String,
        default: "Full-time",
        enum: ["Full-time", "Part-time", "Internship", "Remote", "Contract", "Freelance"]
    },
    location: {
        type: String,
        default: "",
        trim: true
    },
    industry: {
        type: String,
        default: "",
        trim: true
    },
    
    // --- Requirements ---
    education: {
        type: String,
        default: "",
        trim: true
    },
    passedOutYear: {
        type: String,
        default: "",
        trim: true
    },
    experience: {
        type: String,
        default: "",
        trim: true
    },
    salary: {
        type: String,
        default: "",
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Job role is required'],
        trim: true
    },
    keySkills: {
        type: String,
        required: [true, 'Key skills are required'],
        trim: true
    },

    // --- Job ID ---
    jobId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },

    // --- Referral System ---
    refereedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        default: null
    },

    // --- Job Poster ---
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: false,
        default: null
    },
    jobPosted: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
        default: null
    },

    // --- Applicants ---
    appliedMembers: [{
        memberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Member",
            required: true
        },
        status: {
            type: String,
            enum: ["Applied", "Review", "Shortlisted", "Offer", "Accepted", "Rejected"],
            default: "Applied"
        },
        resumeLink: {
            type: String,
            default: "",
            trim: true
        },
        coverLetter: {
            type: String,
            default: "",
            trim: true
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        notes: {
            type: String,
            default: "",
            trim: true
        }
    }],

    // --- Additional Fields ---
    jobType: {
        type: String,
        enum: ["Permanent", "Contract", "Temporary", "Volunteer"],
        default: "Permanent"
    },
    remoteType: {
        type: String,
        enum: ["On-site", "Remote", "Hybrid"],
        default: "On-site"
    },
    benefits: [{
        type: String,
        trim: true
    }],
    applicationDeadline: {
        type: Date
    },
    applicationEndDate: {
        type: Date,
        required: [true, 'Application End Date is required']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],

    // --- Timestamps ---
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }

}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
    return this.appliedMembers.length;
});

// Virtual for accepted applications count
jobSchema.virtual('acceptedCount').get(function() {
    return this.appliedMembers.filter(app => app.status === "Accepted").length;
});

// Virtual for shortlisted applications count
jobSchema.virtual('shortlistedCount').get(function() {
    return this.appliedMembers.filter(app => app.status === "Shortlisted").length;
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text', keySkills: 'text' });
jobSchema.index({ memberId: 1 });
jobSchema.index({ refereedBy: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ isActive: 1 });

// Pre-save middleware to update timestamps and handle missing memberId
jobSchema.pre('save', function(next) {
    if (!this.memberId && this.isNew) {
        mongoose.model('Member').findOne({ role: 'Admin' })
            .then(admin => {
                if (admin) {
                    this.memberId = admin._id;
                    console.log('Auto-assigned admin as job poster:', admin._id);
                }
                next();
            })
            .catch(err => {
                console.log('Could not find admin for auto-assignment:', err.message);
                next();
            });
    } else {
        this.updatedAt = Date.now();
        
        if (this.appliedMembers && this.isModified('appliedMembers')) {
            this.appliedMembers.forEach(app => {
                if (app.isModified('status')) {
                    app.updatedAt = Date.now();
                }
            });
        }
        
        next();
    }
});

// Method to check if a member has applied
jobSchema.methods.hasApplied = function(memberId) {
    return this.appliedMembers.some(app => 
        String(app.memberId) === String(memberId)
    );
};

// Method to get application status for a member
jobSchema.methods.getApplicationStatus = function(memberId) {
    const application = this.appliedMembers.find(app => 
        String(app.memberId) === String(memberId)
    );
    return application ? application.status : null;
};

// Method to add applicant
jobSchema.methods.addApplicant = function(memberId, resumeLink = '', coverLetter = '') {
    if (!this.hasApplied(memberId)) {
        this.appliedMembers.push({
            memberId,
            resumeLink,
            coverLetter,
            status: 'Applied',
            appliedAt: Date.now(),
            updatedAt: Date.now()
        });
        return true;
    }
    return false;
};

// Method to update applicant status
jobSchema.methods.updateApplicantStatus = function(memberId, newStatus) {
    const application = this.appliedMembers.find(app => 
        String(app.memberId) === String(memberId)
    );
    
    if (application) {
        const oldStatus = application.status;
        application.status = newStatus;
        application.updatedAt = Date.now();
        return { success: true, oldStatus, newStatus };
    }
    
    return { success: false };
};

// Static method to get jobs with filters
jobSchema.statics.findWithFilters = async function(filters = {}) {
    const {
        search,
        employmentType,
        location,
        experience,
        salaryMin,
        salaryMax,
        isActive,
        memberId,
        refereedBy,
        page = 1,
        limit = 20
    } = filters;
    
    let query = {};
    
    if (search) {
        query.$text = { $search: search };
    }
    
    if (employmentType) {
        query.employmentType = employmentType;
    }
    
    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }
    
    if (experience) {
        query.experience = { $regex: experience, $options: 'i' };
    }
    
    if (salaryMin || salaryMax) {
        query.salary = {};
        if (salaryMin) query.salary.$gte = salaryMin;
        if (salaryMax) query.salary.$lte = salaryMax;
    }
    
    if (isActive !== undefined) {
        query.isActive = isActive;
    }
    
    if (memberId) {
        query.memberId = memberId;
    }
    
    if (refereedBy) {
        query.refereedBy = refereedBy;
    }
    
    const skip = (page - 1) * limit;
    
    const jobs = await this.find(query)
        .populate('memberId', 'name email photoUrl')
        .populate('refereedBy', 'name email')
        .populate('appliedMembers.memberId', 'name email photoUrl resumeLink mobileNumber highest_education workExp district address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    const total = await this.countDocuments(query);
    
    return {
        jobs,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

module.exports = mongoose.model("Job", jobSchema, "jobs");

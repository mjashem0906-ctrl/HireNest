// //--------------------20/01------------------3.22------------

// const mongoose = require('mongoose');

// const serviceSchema = new mongoose.Schema({
//     // --- Job Details ---
//     title: {
//         type: String,
//         required: [true, 'Job title is required'],
//         trim: true
//     },
//     description: {
//         type: String,
//         required: [true, 'Job description is required'],
//         trim: true
//     },
//     companyName: {
//         type: String,
//         default: "",
//         trim: true
//     },
//     employmentType: {
//         type: String,
//         default: "Full-time",
//         enum: ["Full-time", "Part-time", "Internship", "Remote", "Contract", "Freelance"]
//     },
//     location: {
//         type: String,
//         default: "",
//         trim: true
//     },
    
//     // --- Requirements ---
//     education: {
//         type: String,
//         default: "",
//         trim: true
//     },
//     passedOutYear: {
//         type: String,
//         default: "",
//         trim: true
//     },
//     experience: {
//         type: String,
//         default: "",
//         trim: true
//     },
//     salary: {
//         type: String,
//         default: "",
//         trim: true
//     },
//     role: {
//         type: String,
//         default: "",
//         trim: true
//     },
//     keySkills: {
//         type: String,
//         default: "",
//         trim: true
//     },

//     // --- Referral System ---
//     refereedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Member",
//         default: null
//     },

//     // --- Job Poster ---
//     memberId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Member",
//         required: [true, 'Job poster (member) is required']
//     },

//     // --- Applicants ---
//     appliedMembers: [{
//         memberId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Member",
//             required: true
//         },
//         status: {
//             type: String,
//             enum: ["Applied", "Review", "Shortlisted", "Offer", "Accepted", "Rejected"],
//             default: "Applied"
//         },
//         resumeLink: {
//             type: String,
//             default: "",
//             trim: true
//         },
//         coverLetter: {
//             type: String,
//             default: "",
//             trim: true
//         },
//         appliedAt: {
//             type: Date,
//             default: Date.now
//         },
//         updatedAt: {
//             type: Date,
//             default: Date.now
//         },
//         notes: {
//             type: String,
//             default: "",
//             trim: true
//         }
//     }],

//     // --- Additional Fields ---
//     jobType: {
//         type: String,
//         enum: ["Permanent", "Contract", "Temporary", "Volunteer"],
//         default: "Permanent"
//     },
//     remoteType: {
//         type: String,
//         enum: ["On-site", "Remote", "Hybrid"],
//         default: "On-site"
//     },
//     benefits: [{
//         type: String,
//         trim: true
//     }],
//     applicationDeadline: {
//         type: Date
//     },
//     isActive: {
//         type: Boolean,
//         default: true
//     },
//     views: {
//         type: Number,
//         default: 0
//     },
//     tags: [{
//         type: String,
//         trim: true
//     }],

//     // --- Timestamps ---
//     createdAt: {
//         type: Date,
//         default: Date.now
//     },
//     updatedAt: {
//         type: Date,
//         default: Date.now
//     }

// }, { 
//     timestamps: true,
//     toJSON: { virtuals: true },
//     toObject: { virtuals: true }
// });

// // Virtual for application count
// serviceSchema.virtual('applicationCount').get(function() {
//     return this.appliedMembers.length;
// });

// // Virtual for accepted applications count
// serviceSchema.virtual('acceptedCount').get(function() {
//     return this.appliedMembers.filter(app => app.status === "Accepted").length;
// });

// // Virtual for shortlisted applications count
// serviceSchema.virtual('shortlistedCount').get(function() {
//     return this.appliedMembers.filter(app => app.status === "Shortlisted").length;
// });

// // Indexes for better query performance
// serviceSchema.index({ title: 'text', description: 'text', keySkills: 'text' });
// serviceSchema.index({ memberId: 1 });
// serviceSchema.index({ refereedBy: 1 });
// serviceSchema.index({ employmentType: 1 });
// serviceSchema.index({ location: 1 });
// serviceSchema.index({ createdAt: -1 });
// serviceSchema.index({ isActive: 1 });

// // Pre-save middleware to update timestamps
// serviceSchema.pre('save', function(next) {
//     this.updatedAt = Date.now();
    
//     // Update appliedMembers.updatedAt if status changed
//     if (this.appliedMembers && this.isModified('appliedMembers')) {
//         this.appliedMembers.forEach(app => {
//             if (app.isModified('status')) {
//                 app.updatedAt = Date.now();
//             }
//         });
//     }
    
//     next();
// });

// // Method to check if a member has applied
// serviceSchema.methods.hasApplied = function(memberId) {
//     return this.appliedMembers.some(app => 
//         String(app.memberId) === String(memberId)
//     );
// };

// // Method to get application status for a member
// serviceSchema.methods.getApplicationStatus = function(memberId) {
//     const application = this.appliedMembers.find(app => 
//         String(app.memberId) === String(memberId)
//     );
//     return application ? application.status : null;
// };

// // Method to add applicant
// serviceSchema.methods.addApplicant = function(memberId, resumeLink = '', coverLetter = '') {
//     if (!this.hasApplied(memberId)) {
//         this.appliedMembers.push({
//             memberId,
//             resumeLink,
//             coverLetter,
//             status: 'Applied',
//             appliedAt: Date.now(),
//             updatedAt: Date.now()
//         });
//         return true;
//     }
//     return false;
// };

// // Method to update applicant status
// serviceSchema.methods.updateApplicantStatus = function(memberId, newStatus) {
//     const application = this.appliedMembers.find(app => 
//         String(app.memberId) === String(memberId)
//     );
    
//     if (application) {
//         const oldStatus = application.status;
//         application.status = newStatus;
//         application.updatedAt = Date.now();
//         return { success: true, oldStatus, newStatus };
//     }
    
//     return { success: false };
// };

// // Static method to get jobs with filters
// serviceSchema.statics.findWithFilters = async function(filters = {}) {
//     const {
//         search,
//         employmentType,
//         location,
//         experience,
//         salaryMin,
//         salaryMax,
//         isActive,
//         memberId,
//         refereedBy,
//         page = 1,
//         limit = 20
//     } = filters;
    
//     let query = {};
    
//     // Text search
//     if (search) {
//         query.$text = { $search: search };
//     }
    
//     // Filter by employment type
//     if (employmentType) {
//         query.employmentType = employmentType;
//     }
    
//     // Filter by location
//     if (location) {
//         query.location = { $regex: location, $options: 'i' };
//     }
    
//     // Filter by experience (simplified - you might want more complex logic)
//     if (experience) {
//         query.experience = { $regex: experience, $options: 'i' };
//     }
    
//     // Filter by salary range (requires parsing salary strings)
//     // Note: This is a simplified implementation
//     if (salaryMin || salaryMax) {
//         query.salary = {};
//         if (salaryMin) query.salary.$gte = salaryMin;
//         if (salaryMax) query.salary.$lte = salaryMax;
//     }
    
//     // Filter by active status
//     if (isActive !== undefined) {
//         query.isActive = isActive;
//     }
    
//     // Filter by job poster
//     if (memberId) {
//         query.memberId = memberId;
//     }
    
//     // Filter by referee
//     if (refereedBy) {
//         query.refereedBy = refereedBy;
//     }
    
//     // Calculate skip for pagination
//     const skip = (page - 1) * limit;
    
//     // Execute query
//     const services = await this.find(query)
//         .populate('memberId', 'name email photoUrl')
//         .populate('refereedBy', 'name email')
//         .populate('appliedMembers.memberId', 'name email photoUrl resumeLink')
//         .sort({ createdAt: -1 })
//         .skip(skip)
//         .limit(limit);
    
//     // Get total count for pagination
//     const total = await this.countDocuments(query);
    
//     return {
//         services,
//         total,
//         page,
//         pages: Math.ceil(total / limit)
//     };
// };

// module.exports = mongoose.model("Service", serviceSchema);

//--------------------20/01------------------3.22------------

const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
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
        default: "",
        trim: true
    },
    keySkills: {
        type: String,
        default: "",
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
        required: false, // CHANGED: Made optional to fix validation error
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
serviceSchema.virtual('applicationCount').get(function() {
    return this.appliedMembers.length;
});

// Virtual for accepted applications count
serviceSchema.virtual('acceptedCount').get(function() {
    return this.appliedMembers.filter(app => app.status === "Accepted").length;
});

// Virtual for shortlisted applications count
serviceSchema.virtual('shortlistedCount').get(function() {
    return this.appliedMembers.filter(app => app.status === "Shortlisted").length;
});

// Indexes for better query performance
serviceSchema.index({ title: 'text', description: 'text', keySkills: 'text' });
serviceSchema.index({ memberId: 1 });
serviceSchema.index({ refereedBy: 1 });
serviceSchema.index({ employmentType: 1 });
serviceSchema.index({ location: 1 });
serviceSchema.index({ createdAt: -1 });
serviceSchema.index({ isActive: 1 });

// Pre-save middleware to update timestamps and handle missing memberId
serviceSchema.pre('save', function(next) {
    // If memberId is not set but we're trying to save, try to set a default
    if (!this.memberId && this.isNew) {
        // Try to find a default admin in the system
        // This is a fallback - the controller should handle this better
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
        // Update timestamp
        this.updatedAt = Date.now();
        
        // Update appliedMembers.updatedAt if status changed
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
serviceSchema.methods.hasApplied = function(memberId) {
    return this.appliedMembers.some(app => 
        String(app.memberId) === String(memberId)
    );
};

// Method to get application status for a member
serviceSchema.methods.getApplicationStatus = function(memberId) {
    const application = this.appliedMembers.find(app => 
        String(app.memberId) === String(memberId)
    );
    return application ? application.status : null;
};

// Method to add applicant
serviceSchema.methods.addApplicant = function(memberId, resumeLink = '', coverLetter = '') {
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
serviceSchema.methods.updateApplicantStatus = function(memberId, newStatus) {
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
serviceSchema.statics.findWithFilters = async function(filters = {}) {
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
    
    // Text search
    if (search) {
        query.$text = { $search: search };
    }
    
    // Filter by employment type
    if (employmentType) {
        query.employmentType = employmentType;
    }
    
    // Filter by location
    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }
    
    // Filter by experience (simplified - you might want more complex logic)
    if (experience) {
        query.experience = { $regex: experience, $options: 'i' };
    }
    
    // Filter by salary range (requires parsing salary strings)
    // Note: This is a simplified implementation
    if (salaryMin || salaryMax) {
        query.salary = {};
        if (salaryMin) query.salary.$gte = salaryMin;
        if (salaryMax) query.salary.$lte = salaryMax;
    }
    
    // Filter by active status
    if (isActive !== undefined) {
        query.isActive = isActive;
    }
    
    // Filter by job poster
    if (memberId) {
        query.memberId = memberId;
    }
    
    // Filter by referee
    if (refereedBy) {
        query.refereedBy = refereedBy;
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Execute query
    const services = await this.find(query)
        .populate('memberId', 'name email photoUrl')
        .populate('refereedBy', 'name email')
        .populate('appliedMembers.memberId', 'name email photoUrl resumeLink')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    
    // Get total count for pagination
    const total = await this.countDocuments(query);
    
    return {
        services,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};

module.exports = mongoose.model("Service", serviceSchema);
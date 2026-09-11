const Recruiter = require('../models/Recruiter');
const Member = require('../models/member');

// Helper to format Recruiter doc for frontend UI compatibility
const formatRecruiterDoc = (m) => {
  const canonicalName = m.name || m.fullName || '';
  const canonicalPhone = m.mobileNumber || m.phone || '';
  const canonicalCompany = m.currentInstitutionOrCompany || m.companyName || '';
  const canonicalDistrict = m.district || m.location || '';

  return {
    _id: m._id,
    name: canonicalName,
    fullName: canonicalName,
    email: m.email || '',
    mobileNumber: canonicalPhone,
    phone: canonicalPhone,
    designation: m.designation || 'Recruiter',
    department: m.department || '',
    currentInstitutionOrCompany: canonicalCompany,
    companyName: canonicalCompany,
    companyGST: m.companyGST || '',
    companyEmail: m.companyEmail || m.email || '',
    district: canonicalDistrict,
    location: canonicalDistrict,
    industries: Array.isArray(m.industries) ? m.industries : (m.industries ? [m.industries] : []),
    roleTypes: Array.isArray(m.roleTypes) ? m.roleTypes : [],
    hiringVolume: m.hiringVolume || '',
    teamSize: m.teamSize || '',
    employeeId: m.employeeId || 'N/A',
    memberReferenceNumber: m.memberReferenceNumber ? String(m.memberReferenceNumber) : null,
    registeredVia: m.registeredVia || 'admin',
    memberType: 'Recruiter',
    symMemberStatus: m.symMemberStatus || m.solidarityMember || undefined,
    solidarityMember: m.solidarityMember || m.symMemberStatus || undefined,
    createdAt: m.createdAt,
    updatedAt: m.updatedAt,
  };
};

// @desc    Register a new recruiter (Stored exclusively in MongoDB Recruiter collection)
// @route   POST /api/recruiters
const addRecruiter = async (req, res) => {
  try {
    console.log("📥 Received Recruiter Registration Data:", req.body);

    const { 
      fullName, name, email, phone, mobileNumber, designation, department,
      employeeId, companyName, currentInstitutionOrCompany, companyGST, companyEmail,
      location, district, industries, roleTypes, hiringVolume, teamSize, registeredVia
    } = req.body;

    const recruiterName = (name || fullName || '').trim();
    const recruiterEmail = String(email || '').trim().toLowerCase();
    const recruiterPhone = String(mobileNumber || phone || '').trim();
    const recruiterDesignation = (designation || '').trim();
    const recruiterDept = (department || '').trim();
    const recruiterCompany = (currentInstitutionOrCompany || companyName || '').trim();
    const recruiterCompanyEmail = (companyEmail || recruiterEmail || '').trim().toLowerCase();
    const recruiterDistrict = (district || location || '').trim();
    const recruiterHiringVolume = (hiringVolume || '').trim();
    const recruiterTeamSize = (teamSize || '').trim();
    const recruiterIndustries = Array.isArray(industries) 
      ? industries 
      : (typeof industries === 'string' && industries.trim() 
          ? industries.split(',').map(item => item.trim()).filter(Boolean)
          : []);

    if (
      !recruiterName || !recruiterEmail || !recruiterPhone || !recruiterDesignation || !recruiterDept || 
      !recruiterCompany || !recruiterCompanyEmail || !recruiterDistrict || !recruiterHiringVolume || !recruiterTeamSize ||
      !recruiterIndustries || recruiterIndustries.length === 0
    ) {
      console.log("❌ Validation Failed: Missing required fields");
      return res.status(400).json({ 
        message: "Please fill in all required fields (Name, Email, Phone, Designation, Dept, Company Name, Company Email, Hiring Region, Monthly Hiring Volume, Team Size, Industries)" 
      });
    }

    // Check if recruiter already exists in Recruiter collection with the same email
    const existingRecruiterByEmail = await Recruiter.findOne({ 
      $or: [
        { email: recruiterEmail },
        { email: { $regex: new RegExp(`^${recruiterEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
      ]
    });

    if (existingRecruiterByEmail) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    // Auto-generate sequential memberReferenceNumber across Members & Recruiters
    let memberReferenceNumber = req.body.memberReferenceNumber ? String(req.body.memberReferenceNumber).trim() : null;
    if (!memberReferenceNumber) {
      const allMembers = await Member.find().select('memberReferenceNumber').lean();
      const allRecruiters = await Recruiter.find().select('memberReferenceNumber').lean();
      let maxRefNo = 0;
      
      for (const m of [...allMembers, ...allRecruiters]) {
        if (m.memberReferenceNumber) {
          const parsed = parseInt(m.memberReferenceNumber, 10);
          if (!isNaN(parsed) && parsed > maxRefNo) {
            maxRefNo = parsed;
          }
        }
      }
      memberReferenceNumber = (maxRefNo + 1).toString();
    }

    const statusVal = req.body.solidarityMember || req.body.symMemberStatus || undefined;

    // Canonical Recruiter Data Only (Stored exclusively in Recruiter collection)
    const canonicalData = {
      name: recruiterName,
      email: recruiterEmail,
      mobileNumber: recruiterPhone,
      memberType: 'Recruiter',
      designation: recruiterDesignation,
      department: recruiterDept,
      currentInstitutionOrCompany: recruiterCompany,
      companyGST: companyGST || '',
      companyEmail: recruiterCompanyEmail,
      district: recruiterDistrict,
      industries: recruiterIndustries,
      roleTypes: Array.isArray(roleTypes) ? roleTypes : [],
      hiringVolume: recruiterHiringVolume,
      teamSize: recruiterTeamSize,
      employeeId: employeeId || 'N/A',
      memberReferenceNumber,
      registeredVia: registeredVia || 'admin',
      ...(statusVal ? { symMemberStatus: statusVal, solidarityMember: statusVal } : {}),
    };

    // Store exclusively in MongoDB Recruiter collection (No write to Member or other collections)
    const createdRecruiter = await Recruiter.create(canonicalData);
    console.log("✅ Stored Recruiter exclusively in Recruiter collection:", createdRecruiter._id);

    res.status(201).json({
      _id: createdRecruiter._id,
      fullName: createdRecruiter.name,
      email: createdRecruiter.email,
      memberReferenceNumber: createdRecruiter.memberReferenceNumber,
      message: "Recruiter registered successfully!"
    });

  } catch (error) {
    console.error("Error adding recruiter:", error); 
    res.status(500).json({ message: error.message || "Server Error adding recruiter" });
  }
};

// @desc    Get all recruiters exclusively from Recruiter collection
// @route   GET /api/recruiters
const getRecruiters = async (req, res) => {
  try {
    const recruiters = await Recruiter.find({}).sort({ createdAt: -1 }).lean();
    res.json(recruiters.map(formatRecruiterDoc));
  } catch (error) {
    console.error("Error fetching recruiters:", error);
    res.status(500).json({ message: "Server Error fetching recruiters" });
  }
};

// @desc    Get single recruiter by ID exclusively from Recruiter collection
// @route   GET /api/recruiters/:id
const getRecruiterById = async (req, res) => {
  try {
    const doc = await Recruiter.findById(req.params.id).lean();
    if (doc) {
      return res.json(formatRecruiterDoc(doc));
    }
    res.status(404).json({ message: 'Recruiter not found' });
  } catch (error) {
    console.error("Error fetching recruiter by ID:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update recruiter details exclusively in Recruiter collection
// @route   PUT /api/recruiters/:id
const updateRecruiter = async (req, res) => {
  try {
    const body = req.body;
    const nameVal = (body.name || body.fullName || '').trim() || undefined;
    const phoneVal = (body.mobileNumber || body.phone || body.phoneNumber || '').trim() || undefined;
    const companyVal = (body.currentInstitutionOrCompany || body.companyName || '').trim() || undefined;
    const districtVal = (body.district || body.location || '').trim() || undefined;

    const industriesVal = Array.isArray(body.industries)
      ? body.industries
      : typeof body.industries === 'string' && body.industries.trim()
      ? body.industries.split(',').map(s => s.trim()).filter(Boolean)
      : body.industries;

    const updateData = {
      name: nameVal,
      email: body.email ? String(body.email).trim().toLowerCase() : undefined,
      mobileNumber: phoneVal,
      memberType: 'Recruiter',
      designation: body.designation,
      department: body.department,
      currentInstitutionOrCompany: companyVal,
      companyGST: body.companyGST,
      companyEmail: body.companyEmail,
      district: districtVal,
      industries: industriesVal,
      roleTypes: body.roleTypes,
      hiringVolume: body.hiringVolume,
      teamSize: body.teamSize,
      employeeId: body.employeeId,
      ...(body.memberReferenceNumber ? { memberReferenceNumber: String(body.memberReferenceNumber) } : {}),
      ...(body.symMemberStatus || body.solidarityMember ? {
        symMemberStatus: body.symMemberStatus || body.solidarityMember,
        solidarityMember: body.solidarityMember || body.symMemberStatus,
      } : {}),
    };

    // Clean undefined keys
    Object.keys(updateData).forEach(k => updateData[k] === undefined && delete updateData[k]);

    // Update exclusively in Recruiter collection
    const updatedRecruiter = await Recruiter.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (updatedRecruiter) {
      return res.json(formatRecruiterDoc(updatedRecruiter));
    }

    res.status(404).json({ message: 'Recruiter not found' });
  } catch (error) {
    console.error("Error updating recruiter:", error);
    res.status(500).json({ message: "Error updating recruiter" });
  }
};

// @desc    Delete a recruiter exclusively from Recruiter collection
// @route   DELETE /api/recruiters/:id
const deleteRecruiter = async (req, res) => {
  try {
    const deleted = await Recruiter.findByIdAndDelete(req.params.id);
    if (deleted) {
      return res.status(200).json({ message: "Recruiter removed from Recruiter collection successfully" });
    }
    res.status(404).json({ message: "Recruiter not found" });
  } catch (error) {
    console.error("Error deleting recruiter:", error);
    res.status(500).json({ message: "Error deleting recruiter" });
  }
};

module.exports = { 
  addRecruiter, 
  getRecruiters, 
  getRecruiterById, 
  updateRecruiter, 
  deleteRecruiter 
};
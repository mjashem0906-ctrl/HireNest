const Recruiter = require('../models/Recruiter');
const Member = require('../models/member');
const User = require('../models/login');
const bcrypt = require('bcryptjs');

// Helper to format Recruiter doc for frontend UI compatibility
const formatRecruiterDoc = (m) => {
  const canonicalName = m.name || m.fullName || '';
  const canonicalPhone = m.mobileNumber || m.phone || '';
  const canonicalCompany = m.currentInstitutionOrCompany || m.companyName || '';
  const canonicalDistrict = m.district || m.location || '';
  const existingPwd = m.plainPassword || m.rawPassword || (m.password && !m.password.startsWith('$2') ? m.password : '') || '';

  return {
    _id: m._id,
    name: canonicalName,
    fullName: canonicalName,
    email: m.email || '',
    username: m.username || m.email || '',
    password: existingPwd,
    plainPassword: existingPwd,
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
    roleTypes: Array.isArray(m.roleTypes) ? m.roleTypes : (m.roleTypes ? [m.roleTypes] : []),
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

// @desc    Get total count of recruiters directly from MongoDB recruiters collection
// @route   GET /api/recruiters/count
const getRecruitersCount = async (req, res) => {
  try {
    const count = await Recruiter.countDocuments({});
    res.status(200).json({ count, total: count });
  } catch (error) {
    console.error("Error getting recruiters count:", error);
    res.status(500).json({ message: "Error counting recruiters", count: 0 });
  }
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
    const loginUser = String(req.body.username || req.body.loginUsername || recruiterEmail).trim();
    let hashPwd = undefined;
    let plainPwd = undefined;
    if (req.body.password && String(req.body.password).trim()) {
      plainPwd = String(req.body.password).trim();
      hashPwd = await bcrypt.hash(plainPwd, 10);
    }

    // Canonical Recruiter Data Only (Stored exclusively in Recruiter collection)
    const canonicalData = {
      name: recruiterName,
      email: recruiterEmail,
      username: loginUser,
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
      ...(hashPwd ? { password: hashPwd } : {}),
      ...(plainPwd ? { plainPassword: plainPwd, rawPassword: plainPwd } : {}),
      ...(statusVal ? { symMemberStatus: statusVal, solidarityMember: statusVal } : {}),
    };

    // Store in MongoDB Recruiter collection
    const createdRecruiter = await Recruiter.create(canonicalData);
    console.log("✅ Stored Recruiter exclusively in Recruiter collection:", createdRecruiter._id);

    // If credentials provided, sync to User collection for seamless authentication
    if (hashPwd && loginUser) {
      try {
        await User.findOneAndUpdate(
          { $or: [{ username: loginUser }, { memberId: createdRecruiter._id }] },
          {
            username: loginUser,
            password: hashPwd,
            role: "Recruiter",
            memberId: createdRecruiter._id,
            profileCompleted: 1,
          },
          { upsert: true, new: true }
        );
      } catch (userErr) {
        console.error("Error syncing recruiter to User model:", userErr);
      }
    }

    res.status(201).json({
      _id: createdRecruiter._id,
      fullName: createdRecruiter.name,
      email: createdRecruiter.email,
      username: createdRecruiter.username,
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

    let hashPwd = undefined;
    let plainPwd = undefined;
    if (body.password && String(body.password).trim()) {
      plainPwd = String(body.password).trim();
      hashPwd = await bcrypt.hash(plainPwd, 10);
    }

    const loginUser = (body.username || body.loginUsername || body.email ? String(body.username || body.loginUsername || body.email).trim() : undefined);

    const updateData = {
      name: nameVal,
      email: body.email ? String(body.email).trim().toLowerCase() : undefined,
      username: loginUser,
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
      ...(hashPwd ? { password: hashPwd } : {}),
      ...(plainPwd ? { plainPassword: plainPwd, rawPassword: plainPwd } : {}),
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
      // Sync to User collection if password or username updated
      if (hashPwd || loginUser) {
        try {
          const uName = loginUser || updatedRecruiter.username || updatedRecruiter.email;
          const userFields = {
            username: uName,
            role: "Recruiter",
            memberId: updatedRecruiter._id,
            profileCompleted: 1,
          };
          if (hashPwd) {
            userFields.password = hashPwd;
          }
          await User.findOneAndUpdate(
            { $or: [{ memberId: updatedRecruiter._id }, { username: uName }] },
            { $set: userFields },
            { upsert: true, new: true }
          );
        } catch (uErr) {
          console.error("Error syncing updated recruiter to User collection:", uErr);
        }
      }

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
  getRecruitersCount,
  getRecruiterById,
  updateRecruiter,
  deleteRecruiter
};
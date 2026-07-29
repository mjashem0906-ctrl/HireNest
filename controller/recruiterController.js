const Recruiter = require('../models/Recruiter');
const Member = require('../models/member');

// Helper to format Member doc as Recruiter object for frontend
const formatRecruiterFromMember = (m) => ({
  _id: m._id,
  fullName: m.name || m.fullName || '',
  email: m.email || '',
  phone: m.mobileNumber || m.phone || '',
  designation: m.designation || 'Recruiter',
  department: m.department || '',
  companyName: m.currentInstitutionOrCompany || m.companyName || '',
  companyGST: m.companyGST || '',
  companyEmail: m.companyEmail || m.email || '',
  location: m.district || m.location || '',
  industries: Array.isArray(m.industries) ? m.industries : (m.industries ? [m.industries] : []),
  hiringVolume: m.hiringVolume || '',
  teamSize: m.teamSize || '',
  employeeId: m.employeeId || 'N/A',
  memberReferenceNumber: m.memberReferenceNumber || null,
  registeredVia: m.registeredVia || 'admin',
  createdAt: m.createdAt,
  updatedAt: m.updatedAt,
});

// @desc    Register a new recruiter
// @route   POST /api/recruiters
const addRecruiter = async (req, res) => {
  try {
    console.log("📥 Received Data:", req.body);

    const { 
      fullName, email, phone, designation, department,
      employeeId, companyName, companyGST, companyEmail, location, industries, roleTypes, hiringVolume, teamSize, registeredVia
    } = req.body;

    if (
      !fullName || !email || !phone || !designation || !department || 
      !companyName || !companyEmail || !location || !hiringVolume || !teamSize ||
      !industries || (Array.isArray(industries) && industries.length === 0)
    ) {
      console.log("❌ Validation Failed: Missing required fields");
      return res.status(400).json({ 
        message: "Please fill in all required fields (Name, Email, Phone, Designation, Dept, Company Name, Company Email, Hiring Region, Monthly Hiring Volume, Team Size, Industries)" 
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const recruiterExists = (await Member.findOne({ email: cleanEmail })) || (await Recruiter.findOne({ email: cleanEmail }));
    if (recruiterExists) {
      return res.status(400).json({ message: "This email is already registered" });
    }

    // Auto-generate sequential memberReferenceNumber across Members & Recruiters
    const allMembers = await Member.find().select('memberReferenceNumber');
    const allRecruiters = await Recruiter.find().select('memberReferenceNumber');
    let maxRefNo = 0;
    
    for (const m of [...allMembers, ...allRecruiters]) {
      if (m.memberReferenceNumber) {
        const parsed = parseInt(m.memberReferenceNumber, 10);
        if (!isNaN(parsed) && parsed > maxRefNo) {
          maxRefNo = parsed;
        }
      }
    }
    const memberReferenceNumber = (maxRefNo + 1).toString();

    // 1. Create in Members collection (Primary storage)
    const memberRecruiter = await Member.create({
      name: fullName,
      email: cleanEmail,
      mobileNumber: phone,
      memberType: 'Oppurtunity Provider',
      designation,
      department,
      currentInstitutionOrCompany: companyName,
      companyName,
      companyGST: companyGST || '',
      companyEmail: companyEmail || cleanEmail,
      district: location,
      location,
      industries: Array.isArray(industries) ? industries : [industries],
      hiringVolume,
      teamSize,
      employeeId: employeeId || 'N/A',
      memberReferenceNumber,
      symMemberStatus: 'Active',
      registeredVia: registeredVia || 'admin',
    });

    // 2. Also save to Recruiter collection for backward compatibility
    let recruiterDoc = null;
    try {
      recruiterDoc = await Recruiter.create({
        memberReferenceNumber,
        fullName,
        email: cleanEmail,
        phone,
        designation,
        department,
        companyName,
        companyGST: companyGST || '',
        companyEmail: companyEmail || cleanEmail,
        location,
        industries: Array.isArray(industries) ? industries : [industries],
        hiringVolume,
        teamSize,
        employeeId: employeeId || "N/A",
        roleTypes: roleTypes || [],
        registeredVia: registeredVia || "admin",
        password: "secretPassword123" 
      });
    } catch (e) {
      console.warn("Notice: Saved to Members collection. Recruiter legacy doc error:", e.message);
    }

    console.log("✅ Recruiter Created in Members Collection:", memberRecruiter._id);
    res.status(201).json({
      _id: memberRecruiter._id,
      fullName: memberRecruiter.name,
      email: memberRecruiter.email,
      message: "Recruiter added successfully!"
    });

  } catch (error) {
    console.error("Error adding recruiter:", error); 
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all recruiters from Members collection
// @route   GET /api/recruiters
const getRecruiters = async (req, res) => {
  try {
    // Primary source: Members collection with memberType Oppurtunity Provider / Recruiter
    const memberRecruiters = await Member.find({
      memberType: { $regex: /oppurtunity provider|recruiter/i }
    }).sort({ createdAt: -1 });

    const memberEmails = new Set(memberRecruiters.map(m => m.email?.toLowerCase()));

    // Legacy fallback: Any recruiters from Recruiter collection not yet in Member
    const legacyRecruiters = await Recruiter.find({}).sort({ createdAt: -1 });
    const additionalRecruiters = legacyRecruiters.filter(r => !memberEmails.has(r.email?.toLowerCase()));

    const combinedList = [
      ...memberRecruiters.map(formatRecruiterFromMember),
      ...additionalRecruiters
    ];

    res.json(combinedList);
  } catch (error) {
    console.error("Error fetching recruiters:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get single recruiter from Members collection
// @route   GET /api/recruiters/:id
const getRecruiterById = async (req, res) => {
  try {
    let memberDoc = await Member.findById(req.params.id);
    if (memberDoc) {
      return res.json(formatRecruiterFromMember(memberDoc));
    }
    const legacyDoc = await Recruiter.findById(req.params.id);
    if (legacyDoc) {
      return res.json(legacyDoc);
    }
    res.status(404).json({ message: 'Recruiter not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update recruiter details in Members collection
// @route   PUT /api/recruiters/:id
const updateRecruiter = async (req, res) => {
  try {
    const body = req.body;
    const updateMemberData = {
      name: body.fullName || body.name,
      email: body.email,
      mobileNumber: body.phone || body.phoneNumber || body.mobileNumber,
      designation: body.designation,
      department: body.department,
      currentInstitutionOrCompany: body.companyName,
      companyName: body.companyName,
      companyGST: body.companyGST,
      companyEmail: body.companyEmail,
      district: body.location || body.district,
      location: body.location || body.district,
      industries: Array.isArray(body.industries)
        ? body.industries
        : typeof body.industries === 'string'
        ? body.industries.split(',').map(s => s.trim())
        : body.industries,
      hiringVolume: body.hiringVolume,
      teamSize: body.teamSize,
      employeeId: body.employeeId,
    };

    // Clean undefined keys
    Object.keys(updateMemberData).forEach(k => updateMemberData[k] === undefined && delete updateMemberData[k]);

    let updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      { $set: updateMemberData },
      { new: true }
    );

    // Also update in legacy Recruiter model if present
    try {
      await Recruiter.findByIdAndUpdate(req.params.id, body, { new: true });
    } catch (e) {
      // Ignored if ID is from Member model
    }

    if (updatedMember) {
      return res.json(formatRecruiterFromMember(updatedMember));
    }

    const legacyUpdated = await Recruiter.findByIdAndUpdate(req.params.id, body, { new: true });
    if (legacyUpdated) {
      return res.json(legacyUpdated);
    }

    res.status(404).json({ message: 'Recruiter not found' });
  } catch (error) {
    console.error("Error updating recruiter:", error);
    res.status(500).json({ message: "Error updating recruiter" });
  }
};

// @desc    Delete a recruiter from Members collection
// @route   DELETE /api/recruiters/:id
const deleteRecruiter = async (req, res) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    try {
      await Recruiter.findByIdAndDelete(req.params.id);
    } catch (e) {}

    if (deletedMember) {
      return res.json({ message: "Recruiter removed from Members collection" });
    }
    res.status(404).json({ message: 'Recruiter not found' });
  } catch (error) {
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
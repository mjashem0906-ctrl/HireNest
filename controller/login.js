const User = require("../models/login");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Activity = require("../models/activity");
const Member = require("../models/member");


//Register new user
const register = async (req, res) => {
  const { memberId, username, password, role } = req.body;
  // const {username,password,role} = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "username and password is required" })
  }
  try {
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ error: "Username is already exist" })
    }
    const hashPwd = await bcrypt.hash(password, 10)
    // const newUser = await User.create({username,password:hashPwd,role});
    const newUser = await User.create({ memberId, username, password: hashPwd, role });
    // const member = await Member.findById(memberId);

    //  await Activity.create({
    //           type: 'USER',
    //           action: 'created',
    //           meta: {
    //             username, // username
    //             memberName: member.name, // member names
    //           },
    //           targetId: newUser._id,
    //         });

    res.status(201).json({ message: "User added successfully", user: newUser });
  } catch (err) {
    console.error("Error adding User:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }

}



//login
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials or role" });

    const token = jwt.sign({ userId: user._id, role: user.role, memberId: user.memberId }, process.env.SECRET_KEY, {
      expiresIn: "2h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: 2 * 60 * 60 * 1000,
    }).json({ message: "Login successful", success: true, user: { role: user.role, username: user.username, memberId: user.memberId } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

const getAllUser = async (req, res) => {
  const users = await User.find().populate("memberId", "name photoUrl")
  return res.json(users);
}

//logout
const logOut = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  }).json({ message: "Logged out" });
}

//check
const check = async (req, res) => {
  try {
    // Populate memberId to get resumeLink from the Member document
    const user = await User.findById(req.user.userId).populate('memberId', 'resumeLink name photoUrl');

    if (!user) {
      return res.status(401).json({ message: "User session expired or user removed" });
    }

    // memberId may now be a populated object — extract _id for backward compat
    const memberDoc = user.memberId && typeof user.memberId === 'object' ? user.memberId : null;
    const memberIdValue = memberDoc ? memberDoc._id : (user.memberId || null);

    res.json({
      userId: req.user.userId,
      role: user.role || "Candidate",
      memberId: memberIdValue,
      profileCompleted: user.profileCompleted || 0,
      isGoogleUser: !!user.googleId,
      username: user.username,
      resumeLink: memberDoc?.resumeLink || null,   // ← now sent to frontend
    });
  } catch (err) {
    console.error("Check Auth Error:", err);
    res.status(500).json({ message: "Internal server error during auth check" });
  }
}



const updateProfile = async (req, res) => {
  const { role, profileData } = req.body;
  const userId = req.user.userId;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 1. Determine member type from selected role (Login role is NOT changed — stays as "Candidate")
    const selectedRole = (role && ["Mentor", "Job"].includes(role)) ? role : "Job";


    // 2. Create or Update Member details
    let member;
    if (user.memberId) {
      member = await Member.findById(user.memberId);
    }

    if (!member) {
      member = new Member({
        email: user.username,
        memberType: selectedRole === 'Mentor' ? 'Mentor' : 'Job Seeker',
        ...profileData
      });
      await member.save();
      user.memberId = member._id;
    } else {
      // Only update provided fields
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== undefined && profileData[key] !== null) {
          member[key] = profileData[key];
        }
      });
      await member.save();
    }

    // ── Comprehensive profile completion (20 fields → 5% each = 100%) ──
    // Mirrors the fields tracked in the "Update Detailed Profile" modal
    const hasValue = (v) => {
      if (Array.isArray(v)) return v.length > 0;
      return v !== undefined && v !== null && String(v).trim().length > 0;
    };

    const completionFields = [
      // Basic (6)
      hasValue(member.name),
      hasValue(member.mobileNumber),
      hasValue(member.gender),
      hasValue(member.dateOfBirth),
      hasValue(member.photoUrl),
      hasValue(member.district),
      // Career (5)
      hasValue(member.designation),
      hasValue(member.workExp),
      hasValue(member.careerProfile?.role),
      hasValue(member.careerProfile?.industry),
      hasValue(member.skills),
      // Education / Docs (4)
      hasValue(member.resumeLink),
      hasValue(member.highest_education),
      hasValue(member.branch),
      hasValue(member.passOutYear),
      // Personal (5)
      hasValue(member.fatherName),
      hasValue(member.address || member.hometown),
      hasValue(member.languages),
      hasValue(member.maritalStatus),
      hasValue(member.mobileNumber), // already counted — reuse as email
    ];

    // 20 fields, each worth 5%
    const totalFields = completionFields.length;
    const filledCount = completionFields.filter(Boolean).length;
    const percentage = Math.round((filledCount / totalFields) * 100);
    user.profileCompleted = percentage;

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        role: user.role,
        profileCompleted: user.profileCompleted,
        memberId: user.memberId
      }
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = { login, logOut, check, register, getAllUser, updateProfile }

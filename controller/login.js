const User = require("../models/login");
const GoogleUser = require("../models/googleUser");
const Recruiter = require("../models/Recruiter");
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Activity = require("../models/activity");
const Member = require("../models/member");
const AdminOtp = require("../models/otp");
const { sendAdminPasswordChangedNotification, sendAdminOtpEmail } = require("../utils/emailService");
const { recordAccessSession } = require("../utils/portalAccessTracker");

// Register new user
const register = async (req, res) => {
  const { memberId, username, password, role } = req.body;

  if (!memberId) {
    return res.status(400).json({ message: "Member Name is required" });
  }
  if (!username || !String(username).trim()) {
    return res.status(400).json({ message: "Username is required" });
  }
  if (!password || !String(password).trim()) {
    return res.status(400).json({ message: "Password is required" });
  }

  try {
    let user = await User.findOne({ username });

    if (user) {
      return res
        .status(400)
        .json({ error: "Username is already exist" });
    }

    const hashPwd = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      memberId,
      username,
      password: hashPwd,
      role,
    });

    res.status(201).json({
      message: "User added successfully",
      user: newUser,
    });

  } catch (err) {
    console.error("Error adding User:", err);

    res.status(500).json({
      message: "Server Error",
      error: err.message,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const rawUsername = String(username || "").trim();
    const normalizedUsername = rawUsername.toLowerCase();

    // ── RECRUITER LOGIN ──
    if (role === "Recruiter") {
      let recruiter = await Recruiter.findOne({
        $or: [
          { email: normalizedUsername },
          { email: { $regex: new RegExp(`^${normalizedUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
          { username: rawUsername },
          { username: { $regex: new RegExp(`^${rawUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
        ]
      });

      let user = null;
      if (!recruiter) {
        user = await User.findOne({ username: rawUsername, role: "Recruiter" }) ||
               await User.findOne({ username: normalizedUsername, role: "Recruiter" });
        if (user && user.memberId) {
          recruiter = await Recruiter.findById(user.memberId);
        }
      }

      if (!recruiter && !user) {
        return res.status(404).json({
          success: false,
          message: "Recruiter account not found. Please check your credentials.",
        });
      }

      const storedPassword = recruiter?.password || user?.password;
      if (storedPassword) {
        const isMatch = await bcrypt.compare(password, storedPassword);
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: "Invalid credentials",
          });
        }
      } else {
        // If no password exists yet on this recruiter record, set and hash it for future logins
        const hashPwd = await bcrypt.hash(password, 10);
        if (recruiter) {
          recruiter.password = hashPwd;
          await recruiter.save();
        }
        if (user) {
          user.password = hashPwd;
          await user.save();
        }
      }

      const recruiterId = recruiter?._id || user?._id;
      const token = jwt.sign(
        {
          userId: recruiterId,
          role: "Recruiter",
          recruiterId: recruiterId,
          memberId: recruiterId,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "7d",
        }
      );

      return res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .json({
          message: "Login successful",
          success: true,
          token,
          user: {
            role: "Recruiter",
            username: recruiter?.email || recruiter?.name || user?.username,
            name: recruiter?.name || user?.username,
            recruiterId: recruiterId,
            memberId: recruiterId,
            companyName: recruiter?.currentInstitutionOrCompany || "",
            profileCompleted: 1,
          },
        });
    }

    // ── ADMIN LOGIN ──
    if (role === "Admin") {
      let admin = await Admin.findOne({
        $or: [
          { username: rawUsername },
          { username: { $regex: new RegExp(`^${rawUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
        ]
      });

      if (!admin) {
        // Fallback: check User collection if legacy Admin was in User model
        admin = await User.findOne({ username: rawUsername, role: "Admin" }) ||
                await User.findOne({ username: normalizedUsername, role: "Admin" });
      }

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin account not found. Please check your credentials.",
        });
      }

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // GENERATE JWT TOKEN
      const token = jwt.sign(
        {
          userId: admin._id,
          role: "Admin",
          memberId: admin.memberId || admin._id,
        },
        process.env.SECRET_KEY,
        {
          expiresIn: "24h",
        }
      );

      // SET COOKIE + RETURN TOKEN
      return res
        .cookie("token", token, {
          httpOnly: true,
          sameSite: "None",
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        })
        .json({
          message: "Login successful",
          success: true,
          token,
          user: {
            role: "Admin",
            username: admin.username,
            memberId: admin.memberId || admin._id,
            profileCompleted: 1,
          },
        });
    }

    // ── OTHER USERS LOGIN ──
    let user = await User.findOne({ username: rawUsername });
    if (!user) {
      user = await Admin.findOne({ username: rawUsername });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials or role",
      });
    }

    // GENERATE JWT TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        memberId: user.memberId || user._id,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    // SET COOKIE + RETURN TOKEN
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
        success: true,
        token,
        user: {
          role: user.role,
          username: user.username,
          memberId: user.memberId || user._id,
          profileCompleted: user.profileCompleted || 1,
        },
      });

  } catch (err) {
    console.error("Login Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getAllUser = async (req, res) => {
  const admins = await Admin.find().select("-password");
  const users = await User.find().populate(
    "memberId",
    "name photoUrl"
  );
  const googleUsers = await GoogleUser.find().populate(
    "memberId",
    "name photoUrl"
  );

  const combined = [...admins, ...users, ...googleUsers].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return res.json(combined);
};

// LOGOUT
const logOut = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    })
    .json({
      message: "Logged out",
    });
};

// CHECK AUTH
const check = async (req, res) => {
  try {
    if (req.user?.role === "Recruiter") {
      let recruiter = await Recruiter.findById(req.user.userId || req.user.recruiterId);
      if (!recruiter) {
        recruiter = await User.findById(req.user.userId);
      }
      if (recruiter) {
        return res.json({
          userId: recruiter._id,
          role: "Recruiter",
          recruiterId: recruiter._id,
          memberId: recruiter._id,
          username: recruiter.email || recruiter.name || recruiter.username,
          name: recruiter.name || recruiter.username,
          companyName: recruiter.currentInstitutionOrCompany || "",
          profileCompleted: 1,
          isGoogleUser: false,
        });
      }
    }

    if (req.user?.role === "Admin") {
      let admin = await Admin.findById(req.user.userId);
      if (!admin) {
        admin = await User.findById(req.user.userId);
      }
      if (admin) {
        return res.json({
          userId: admin._id,
          role: "Admin",
          memberId: admin.memberId || admin._id,
          profileCompleted: 1,
          isGoogleUser: false,
          username: admin.username,
        });
      }
    }

    let user = await User.findById(req.user.userId).populate(
      "memberId",
      "resumeLink name photoUrl"
    );

    if (!user) {
      user = await GoogleUser.findById(req.user.userId).populate(
        "memberId",
        "resumeLink name photoUrl"
      );
    }

    if (!user) {
      return res.status(401).json({
        message: "User session expired or user removed",
      });
    }

    const memberDoc =
      user.memberId && typeof user.memberId === "object"
        ? user.memberId
        : null;

    const memberIdValue = memberDoc
      ? memberDoc._id
      : user.memberId || null;

    res.json({
      userId: req.user.userId,
      role: user.role || "Candidate",
      memberId: memberIdValue,
      profileCompleted: user.profileCompleted || 0,
      isGoogleUser: !!user.googleId,
      username: user.username,
      resumeLink: memberDoc?.resumeLink || null,
    });

  } catch (err) {
    console.error("Check Auth Error:", err);

    res.status(500).json({
      message: "Internal server error during auth check",
    });
  }
};

const updateProfile = async (req, res) => {
  const { role, profileData } = req.body;
  const userId = req.user.userId;

  if (profileData) {
    if (profileData.mobileNumber !== undefined) {
      const rawMobile = String(profileData.mobileNumber || "").trim();
      if (!rawMobile) {
        return res.status(400).json({ message: "Mobile Number is required." });
      }
      const cleanMobile = rawMobile.replace(/\D/g, "");
      if (cleanMobile.length !== 10) {
        return res.status(400).json({ message: "Mobile Number must be exactly 10 digits." });
      }
    }
    if (profileData.name !== undefined && !String(profileData.name || "").trim()) {
      return res.status(400).json({ message: "Full Name is required." });
    }
    if (profileData.email !== undefined && !String(profileData.email || "").trim()) {
      return res.status(400).json({ message: "Email is required." });
    }
  }

  try {
    let user = await User.findById(userId);
    if (!user) {
      user = await GoogleUser.findById(userId);
    }

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const selectedRole =
      role && ["Mentor", "Job"].includes(role)
        ? role
        : "Job";

    let member;

    if (user.memberId) {
      member = await Member.findById(user.memberId);
    }

    if (!member) {
      const statusVal = profileData.solidarityMember || profileData.symMemberStatus;

      member = new Member({
        email: user.username,
        googleId: user.googleId || undefined,
        memberType:
          selectedRole === "Mentor"
            ? "Mentor"
            : "Job Seeker",
        ...profileData,
        solidarityMember: statusVal || undefined,
        symMemberStatus: statusVal || undefined,
      });

      await member.save();

      user.memberId = member._id;

    } else {
      if (user.googleId && !member.googleId) {
        member.googleId = user.googleId;
      }
      Object.keys(profileData).forEach((key) => {
        if (
          profileData[key] !== undefined &&
          profileData[key] !== null
        ) {
          member[key] = profileData[key];
        }
      });

      const statusVal = profileData.solidarityMember || profileData.symMemberStatus;
      if (statusVal !== undefined) {
        member.solidarityMember = statusVal;
        member.symMemberStatus = statusVal;
      }

      await member.save();
    }

    const hasValue = (v) => {
      if (Array.isArray(v)) return v.length > 0;

      return (
        v !== undefined &&
        v !== null &&
        String(v).trim().length > 0
      );
    };

    const completionFields = [
      hasValue(member.name),
      hasValue(member.mobileNumber),
      hasValue(member.gender),
      hasValue(member.dateOfBirth),
      hasValue(member.photoUrl),
      hasValue(member.district),

      hasValue(member.designation),
      hasValue(member.workExp),
      hasValue(member.careerProfile?.role),
      hasValue(member.careerProfile?.industry),
      hasValue(member.skills),

      hasValue(member.resumeLink),
      hasValue(member.highest_education),
      hasValue(member.branch),
      hasValue(member.passOutYear),

      hasValue(member.fatherName),
      hasValue(member.address || member.hometown),
      hasValue(member.languages),
      hasValue(member.maritalStatus),
      hasValue(member.employmentType || member.careerProfile?.employmentType),
      hasValue(member.mobileNumber),
    ];

    const totalFields = completionFields.length;
    const filledCount = completionFields.filter(Boolean).length;

    const percentage = Math.round(
      (filledCount / totalFields) * 100
    );

    user.profileCompleted = percentage;

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        role: user.role,
        profileCompleted: user.profileCompleted,
        memberId: user.memberId,
      },
    });

  } catch (err) {
    console.error("Update Profile Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId;

  try {
    let user = await Admin.findById(userId);
    if (!user) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await GoogleUser.findById(userId);
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    const hashPwd = await bcrypt.hash(newPassword, 10);
    user.password = hashPwd;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const verifyAdminEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Validate entered email against database
    let isValidAdminEmail = false;

    if (req.user?.userId) {
      const loggedAdmin = await Admin.findById(req.user.userId);
      if (loggedAdmin) {
        if (
          (loggedAdmin.email && loggedAdmin.email.trim().toLowerCase() === normalizedEmail) ||
          (loggedAdmin.username && loggedAdmin.username.trim().toLowerCase() === normalizedEmail)
        ) {
          isValidAdminEmail = true;
        }
      }
      const loggedUser = await User.findById(req.user.userId);
      if (loggedUser && loggedUser.role === "Admin") {
        if (loggedUser.memberId) {
          const member = await Member.findById(loggedUser.memberId);
          if (member && member.email && member.email.trim().toLowerCase() === normalizedEmail) {
            isValidAdminEmail = true;
          }
        }
      }
    }

    if (!isValidAdminEmail) {
      const adminDoc = await Admin.findOne({
        $or: [
          { email: normalizedEmail },
          { username: normalizedEmail }
        ]
      });
      if (adminDoc) {
        isValidAdminEmail = true;
      }
    }

    if (!isValidAdminEmail) {
      const adminMember = await Member.findOne({ email: normalizedEmail });
      if (adminMember) {
        const u = await User.findOne({ memberId: adminMember._id });
        if (u && u.role === "Admin") {
          isValidAdminEmail = true;
        }
      }
    }

    if (!isValidAdminEmail) {
      const adminUser = await User.findOne({ username: normalizedEmail, role: "Admin" });
      if (adminUser) {
        isValidAdminEmail = true;
      }
    }

    if (!isValidAdminEmail && normalizedEmail === "info@jobbridge.com") {
      isValidAdminEmail = true;
    }

    if (!isValidAdminEmail) {
      const recruiter = await Recruiter.findOne({
        $or: [
          { email: normalizedEmail },
          { email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
        ]
      });
      if (recruiter) {
        isValidAdminEmail = true;
      }
    }

    if (!isValidAdminEmail) {
      return res.status(400).json({ success: false, message: "Invalid email address. Email does not match any registered account." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database (removes old OTP for this email)
    await AdminOtp.deleteMany({ email: normalizedEmail });
    await AdminOtp.create({
      email: normalizedEmail,
      otp: otp,
      verified: false
    });

    // Send OTP email
    try {
      await sendAdminOtpEmail(normalizedEmail, otp);
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr);
      return res.status(500).json({ success: false, message: "Failed to send OTP email. Please verify email configuration." });
    }

    res.json({ success: true, message: "6-digit OTP sent to your registered email address." });
  } catch (err) {
    console.error("Verify Email Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const verifyAdminOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedOtp = String(otp || "").trim();

    if (!normalizedEmail || !normalizedOtp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const otpRecord = await AdminOtp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: "OTP has expired or does not exist. Please request a new OTP." });
    }

    if (otpRecord.otp !== normalizedOtp) {
      return res.status(400).json({ success: false, message: "Incorrect OTP. Please try again." });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({ success: true, message: "OTP verified successfully. You can now set your new password." });
  } catch (err) {
    console.error("Verify OTP Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const changePasswordByEmail = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedOtp = String(otp || "").trim();

    if (!newPassword || newPassword.length < 4) {
      return res.status(400).json({ success: false, message: "Please enter a valid new password." });
    }

    const otpRecord = await AdminOtp.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });
    if (!otpRecord || !otpRecord.verified || otpRecord.otp !== normalizedOtp) {
      return res.status(400).json({ success: false, message: "OTP verification failed or expired. Please verify OTP first." });
    }

    const hashPwd = await bcrypt.hash(newPassword, 10);
    let updated = false;

    // Check Admin model
    const admin = await Admin.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedEmail }
      ]
    });
    if (admin) {
      admin.password = hashPwd;
      await admin.save();
      updated = true;
    }

    // Check Recruiter
    const recruiter = await Recruiter.findOne({
      $or: [
        { email: normalizedEmail },
        { email: { $regex: new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }
      ]
    });
    if (recruiter) {
      recruiter.password = hashPwd;
      await recruiter.save();
      updated = true;
    }

    // Check User model
    let user = null;
    if (req.user?.userId) {
      user = await User.findById(req.user.userId);
    }
    if (!user) {
      const member = await Member.findOne({ email: normalizedEmail });
      if (member) {
        user = await User.findOne({ memberId: member._id });
      }
    }
    if (!user && !updated) {
      user = await User.findOne({ role: "Admin" });
    }

    if (user) {
      user.password = hashPwd;
      await user.save();
      updated = true;
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: "Account not found." });
    }

    // Clear OTP record after successful password change
    await AdminOtp.deleteMany({ email: normalizedEmail });

    try {
      await sendAdminPasswordChangedNotification(normalizedEmail, recruiter?.name || admin?.username || user?.username || 'User');
    } catch (emailErr) {
      console.error("Failed to send password change notification:", emailErr);
    }

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Change Password by Email Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  login,
  logOut,
  check,
  register,
  getAllUser,
  updateProfile,
  changePassword,
  verifyAdminEmail,
  verifyAdminOtp,
  changePasswordByEmail,
};
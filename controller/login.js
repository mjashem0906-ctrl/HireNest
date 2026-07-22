const User = require("../models/login");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Activity = require("../models/activity");
const Member = require("../models/member");
const AdminOtp = require("../models/otp");
const { sendAdminPasswordChangedNotification, sendAdminOtpEmail } = require("../utils/emailService");

// Register new user
const register = async (req, res) => {
  const { memberId, username, password, role } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "username and password is required" });
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
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials or role",
      });
    }

    // GENERATE JWT TOKEN
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        memberId: user.memberId,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );

    // SET COOKIE + RETURN TOKEN
    res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
        maxAge: 2 * 60 * 60 * 1000,
      })
      .json({
        message: "Login successful",
        success: true,

        // IMPORTANT
        token,

        user: {
          role: user.role,
          username: user.username,
          memberId: user.memberId,
        },
      });

  } catch (err) {
    console.error("Login Error:", err);

    res.status(500).json({
      message: err.message,
    });
  }
};

const getAllUser = async (req, res) => {
  const users = await User.find().populate(
    "memberId",
    "name photoUrl"
  );

  return res.json(users);
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
    const user = await User.findById(req.user.userId).populate(
      "memberId",
      "resumeLink name photoUrl"
    );

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

  try {
    let user = await User.findById(userId);

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
      member = new Member({
        email: user.username,
        memberType:
          selectedRole === "Mentor"
            ? "Mentor"
            : "Job Seeker",
        ...profileData,
      });

      await member.save();

      user.memberId = member._id;

    } else {
      Object.keys(profileData).forEach((key) => {
        if (
          profileData[key] !== undefined &&
          profileData[key] !== null
        ) {
          member[key] = profileData[key];
        }
      });

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
    const user = await User.findById(userId);

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

    if (!isValidAdminEmail && normalizedEmail === "info.jobbridge@solidaritykarnataka.org") {
      isValidAdminEmail = true;
    }

    if (!isValidAdminEmail) {
      return res.status(400).json({ success: false, message: "Invalid email address. Email does not match any registered admin account." });
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
    console.error("Verify Admin Email Error:", err);
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
    console.error("Verify Admin OTP Error:", err);
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
    if (!user) {
      user = await User.findOne({ role: "Admin" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "Admin account not found." });
    }

    const hashPwd = await bcrypt.hash(newPassword, 10);
    user.password = hashPwd;
    await user.save();

    // Clear OTP record after successful password change
    await AdminOtp.deleteMany({ email: normalizedEmail });

    try {
      await sendAdminPasswordChangedNotification(normalizedEmail, user.username || 'Admin');
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
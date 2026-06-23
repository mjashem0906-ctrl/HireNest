const MentorConnection = require("../models/mentorConnection");
const Member = require("../models/member");

// Create a mentor connection request
exports.createMentorConnection = async (req, res) => {
  try {
    const { mentorId, message } = req.body;
    const userId = req.user?.userId;

    // JWT may not have memberId for new Google users — fall back to DB lookup
    let userMemberId = req.user?.memberId;
    if (!userMemberId && userId) {
      const LoginUser = require("../models/login");
      const loginDoc = await LoginUser.findById(userId).select("memberId");
      userMemberId = loginDoc?.memberId;
    }

    if (!userId || !mentorId || !userMemberId) {
      return res.status(400).json({
        error: "User ID, User Member ID and Mentor ID are required",
      });
    }

    // Check if connection already exists
    const existingConnection = await MentorConnection.findOne({
      userId,
      mentorId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingConnection) {
      return res.status(400).json({
        error: "You already have a pending or active connection with this mentor",
      });
    }

    // Get current user member profile
    const user = await Member.findById(userMemberId);

    // Get mentor profile
    const mentor = await Member.findById(mentorId);

    if (!user || !mentor) {
      return res.status(404).json({ error: "User or Mentor not found" });
    }

    const connection = new MentorConnection({
      userId,
      userMemberId, // ✅ save profile id
      userDetails: {
        name: user.name,
        email: user.email,
        phone: user.mobileNumber,
        role: user.role,
        memberType: user.memberType,
        photoUrl: user.photoUrl,
      },
      mentorId,
      mentorDetails: {
        name: mentor.name,
        email: mentor.email,
        designation: mentor.designation,
        experience: mentor.workExp,
        photoUrl: mentor.photoUrl,
      },
      message,
    });

    await connection.save();

    // Trigger notification to Admin for new mentor connection request
    try {
      const { triggerNotification } = require("../utils/notificationHelper");
      await triggerNotification({
        type: "pending_action",
        recipientId: null, // Broadcast to Admin
        title: "New Mentor Connection Request",
        message: `Candidate "${user.name}" has requested to connect with Mentor "${mentor.name}".`,
        relatedId: connection._id,
        relatedModel: "MentorConnection",
        data: {
          candidateName: user.name,
          mentorName: mentor.name
        }
      });
    } catch (err) {
      console.error("Failed to trigger admin notification for new mentor connection request:", err);
    }

    res.status(201).json({
      message: "Connection request sent successfully",
      connection,
    });
  } catch (error) {
    console.error("Error creating mentor connection:", error);
    res.status(500).json({ error: "Failed to create connection request" });
  }
};

// Get all mentor connections (admin)
exports.getAllMentorConnections = async (req, res) => {
  try {
    const connections = await MentorConnection.find().sort({ createdAt: -1 });
    res.json(connections);
  } catch (error) {
    console.error("Error fetching mentor connections:", error);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
};

// Get mentor connection requests for specific mentor
exports.getMentorConnectionsByMentor = async (req, res) => {
  try {
    const { mentorId } = req.params;
    const User = require("../models/login");

    const connections = await MentorConnection.find({ mentorId }).sort({
      createdAt: -1,
    });

    // For any connection missing userMemberId (old records), look it up via userId → User.memberId
    const enriched = await Promise.all(
      connections.map(async (conn) => {
        const obj = conn.toObject();
        if (!obj.userMemberId && obj.userId) {
          try {
            const userDoc = await User.findById(obj.userId).select("memberId");
            if (userDoc?.memberId) {
              obj.userMemberId = userDoc.memberId;
            }
          } catch (_) {}
        }
        return obj;
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error("Error fetching connections for mentor:", error);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
};

// Get current user's mentor connections
exports.getUserMentorConnections = async (req, res) => {
  try {
    const userId = req.user?.userId;

    const connections = await MentorConnection.find({ userId }).sort({
      createdAt: -1,
    });

    res.json(connections);
  } catch (error) {
    console.error("Error fetching user connections:", error);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
};

// Update mentor connection status
exports.updateMentorConnection = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const connection = await MentorConnection.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    // Trigger notification to candidate when request is accepted
    if (status === "accepted") {
      try {
        const { triggerNotification } = require("../utils/notificationHelper");
        await triggerNotification({
          type: "mentor_acceptance",
          recipientId: connection.userId, // target user account
          title: "Mentor Request Accepted",
          message: `Mentor "${connection.mentorDetails.name}" has accepted your connection request.`,
          relatedId: connection.mentorId,
          relatedModel: "Mentor",
          data: {
            mentorName: connection.mentorDetails.name,
            mentorEmail: connection.mentorDetails.email,
            mentorPhone: connection.mentorDetails.phone
          }
        });
      } catch (err) {
        console.error("Failed to trigger mentor acceptance notification:", err);
      }
    }

    res.json({
      message: `Connection ${status} successfully`,
      connection,
    });
  } catch (error) {
    console.error("Error updating mentor connection:", error);
    res.status(500).json({ error: "Failed to update connection" });
  }
};

// Delete mentor connection
exports.deleteMentorConnection = async (req, res) => {
  try {
    const { id } = req.params;

    const connection = await MentorConnection.findByIdAndDelete(id);

    if (!connection) {
      return res.status(404).json({ error: "Connection not found" });
    }

    res.json({ message: "Connection deleted successfully" });
  } catch (error) {
    console.error("Error deleting mentor connection:", error);
    res.status(500).json({ error: "Failed to delete connection" });
  }
};
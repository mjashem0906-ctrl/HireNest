const Notification = require("../models/Notification");
const NotificationWorkflow = require("../models/NotificationWorkflow");

// GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    // Fetch notifications targetted at the specific user or their role
    const notifications = await Notification.find({
      $or: [
        { recipient: userId },
        { recipientRole: role }
      ]
    }).sort({ createdAt: -1 }).limit(100);

    // Calculate unread status for each notification
    const mappedNotifications = notifications.map(n => {
      const isUnread = n.recipient 
        ? !n.isRead 
        : !n.readBy.includes(userId);
      
      const nObj = n.toObject();
      nObj.isUnread = isUnread;
      return nObj;
    });

    const unreadCount = mappedNotifications.filter(n => n.isUnread).length;

    res.status(200).json({
      success: true,
      unreadCount,
      notifications: mappedNotifications
    });
  } catch (error) {
    console.error("getNotifications error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    if (notification.recipient) {
      notification.isRead = true;
    } else {
      if (!notification.readBy.includes(userId)) {
        notification.readBy.push(userId);
      }
    }

    await notification.save();
    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("markAsRead error:", error);
    res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

// PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    await Promise.all([
      // Update individual notifications
      Notification.updateMany(
        { recipient: userId, isRead: false },
        { $set: { isRead: true } }
      ),
      // Update role-based notifications
      Notification.updateMany(
        { recipientRole: role, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      )
    ]);

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    res.status(500).json({ success: false, message: "Failed to update notifications" });
  }
};

// GET /api/notifications/workflow (Admin only)
const getWorkflowSettings = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const settings = await NotificationWorkflow.find().sort({ notificationType: 1 });
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("getWorkflowSettings error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch workflow settings" });
  }
};

// PUT /api/notifications/workflow (Admin only)
const updateWorkflowSettings = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    const { workflows } = req.body;
    if (!Array.isArray(workflows)) {
      return res.status(400).json({ success: false, message: "Workflows must be an array" });
    }

    for (const w of workflows) {
      await NotificationWorkflow.findOneAndUpdate(
        { notificationType: w.notificationType },
        { 
          $set: { 
            inAppEnabled: w.inAppEnabled,
            emailEnabled: w.emailEnabled 
          }
        }
      );
    }

    const updated = await NotificationWorkflow.find().sort({ notificationType: 1 });
    res.status(200).json({ success: true, message: "Workflow settings updated", data: updated });
  } catch (error) {
    console.error("updateWorkflowSettings error:", error);
    res.status(500).json({ success: false, message: "Failed to update workflow settings" });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getWorkflowSettings,
  updateWorkflowSettings
};

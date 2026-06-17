const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getWorkflowSettings,
  updateWorkflowSettings,
  dismissNotification,
  dismissAllNotifications,
  deleteNotification
} = require("../controller/notification");

// Get all notifications for logged-in user
router.get("/", verifyToken, getNotifications);

// Static bulk routes MUST come before dynamic /:id routes
// Dismiss all notifications
router.patch("/dismiss-all", verifyToken, dismissAllNotifications);

// Mark all notifications as read (must be before /:id/read)
router.patch("/read-all", verifyToken, markAllAsRead);

// Mark a single notification as read
router.patch("/:id/read", verifyToken, markAsRead);

// Dismiss a single notification
router.patch("/:id/dismiss", verifyToken, dismissNotification);

// Permanently delete a single notification
router.delete("/:id", verifyToken, deleteNotification);

// Get notification workflow configurations (Admin only)
router.get("/workflow", verifyToken, getWorkflowSettings);

// Update notification workflow configurations (Admin only)
router.put("/workflow", verifyToken, updateWorkflowSettings);

module.exports = router;

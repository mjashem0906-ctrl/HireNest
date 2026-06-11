const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/auth");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getWorkflowSettings,
  updateWorkflowSettings
} = require("../controller/notification");

// Get all notifications for logged-in user
router.get("/", verifyToken, getNotifications);

// Mark a single notification as read
router.patch("/:id/read", verifyToken, markAsRead);

// Mark all notifications as read
router.patch("/read-all", verifyToken, markAllAsRead);

// Get notification workflow configurations (Admin only)
router.get("/workflow", verifyToken, getWorkflowSettings);

// Update notification workflow configurations (Admin only)
router.put("/workflow", verifyToken, updateWorkflowSettings);

module.exports = router;

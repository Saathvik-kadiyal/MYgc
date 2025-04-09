const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller.js");
const authenticate = require("../middleware/auth.middleware");

// Get all notifications
router.get("/", authenticate, notificationController.getNotifications);

// Mark a notification as read
router.patch("/:id/read", authenticate, notificationController.markAsRead);

// Mark all notifications as read
router.patch("/read-all", authenticate, notificationController.markAllAsRead);

// Mark a notification as completed
router.patch("/:id/complete", authenticate, notificationController.markAsCompleted);

// Delete a notification
router.delete("/:id", authenticate, notificationController.deleteNotification);

module.exports = router;

const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

// Protected routes
router.get("/", authMiddleware, notificationController.getNotifications);
router.put("/:id/read", authMiddleware, notificationController.markAsRead);
router.put("/read-all", authMiddleware, notificationController.markAllAsRead);

module.exports = router;

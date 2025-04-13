const express = require("express");
const router = express.Router();

// Import all route files
const userRoutes = require("./user.route.js");
const authRoutes = require("./auth.route.js");
const companyRoutes = require("./company.route.js");
const connectionRoutes = require("./connection.route.js");
const postRoutes = require("./post.route.js");
const notificationRoutes = require("./notification.route.js");
const jobRoutes = require("./job.route.js");
const searchRoutes = require("./search.route.js");

// Public routes
router.use("/auth", authRoutes);

// Protected routes
router.use("/users", userRoutes);
router.use("/companies", companyRoutes);
router.use("/connections", connectionRoutes);
router.use("/posts", postRoutes);
router.use("/notifications", notificationRoutes);
router.use("/jobs", jobRoutes);
router.use("/search", searchRoutes);

module.exports = router;

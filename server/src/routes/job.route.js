const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");

// Public routes
router.get("/", jobController.getAllJobs);
router.get("/:jobId", jobController.getJobById);

// Protected routes
router.get("/search", authMiddleware, jobController.searchJobs);
router.post("/", authMiddleware, jobController.postJob);
router.post("/:jobId/apply", authMiddleware, jobController.applyToJob);
router.get("/applied", authMiddleware, jobController.getAppliedJobs);
router.get("/:jobId/applications", authMiddleware, jobController.getJobApplications);
router.patch("/:jobId/applications/:userId", authMiddleware, jobController.updateApplicationStatus);

router.get("/company", authMiddleware, jobController.getCompanyJobs);
router.delete("/:jobId", authMiddleware, jobController.deleteJob);

module.exports = router;

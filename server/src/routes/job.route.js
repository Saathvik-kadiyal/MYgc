const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller.js");
const authenticate = require("../middleware/auth.middleware.js");

// Public routes
router.get("/", jobController.getAllJobs);
router.get("/search", authenticate, jobController.searchJobs);
router.get("/:jobId", jobController.getJobById);

// Protected routes
router.post("/", authenticate, jobController.postJob);
router.post("/:jobId/apply", authenticate, jobController.applyToJob);
router.get("/applied", authenticate, jobController.getAppliedJobs);
router.get("/:jobId/applications", authenticate, jobController.getJobApplications);
router.patch("/:jobId/applications/:userId", authenticate, jobController.updateApplicationStatus);

router.get("/company", authenticate, jobController.getCompanyJobs);
router.delete("/:jobId", authenticate, jobController.deleteJob);

module.exports = router;

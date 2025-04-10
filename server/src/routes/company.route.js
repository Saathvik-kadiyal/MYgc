const express = require("express");
const router = express.Router();
const companyJobPostsController = require("../controllers/companyJobPosts.controller");
const companyAuthMiddleware = require("../middleware/companyAuth.middleware");

// Job Posts Management
router.post("/jobposts", companyAuthMiddleware, companyJobPostsController.createJobPost);
router.get("/jobposts", companyAuthMiddleware, companyJobPostsController.getCompanyJobPosts);

module.exports = router;

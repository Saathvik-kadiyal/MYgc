const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const authController = require("../controllers/auth.controller");
const companyJobPostsController = require("../controllers/companyJobPosts.controller");
const { upload, handleUploadError } = require("../middleware/upload.middleware");

// Protected routes - require company authentication
router.use(authMiddleware);

// Company profile routes
router.get("/profile", (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ 
            success: false,
            message: "Only companies can access this route" 
        });
    }
    next();
}, authController.getCompanyProfile);

router.put("/profile", (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ 
            success: false,
            message: "Only companies can access this route" 
        });
    }
    next();
}, authController.updateCompanyProfile);

router.post("/profile/upload", (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ 
            success: false,
            message: "Only companies can access this route" 
        });
    }
    next();
}, upload.single("image"), handleUploadError, authController.uploadProfilePicture);

// Job posting routes
router.post("/jobposts", (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ 
            success: false,
            message: "Only companies can create job posts" 
        });
    }
    next();
}, companyJobPostsController.createJobPost);

router.get("/jobposts", (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ 
            success: false,
            message: "Only companies can view their job posts" 
        });
    }
    next();
}, companyJobPostsController.getCompanyJobPosts);

// Company connections
router.get("/connections", (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ 
            success: false,
            message: "Only companies can access connections" 
        });
    }
    next();
}, authController.getConnections);

router.post("/connections/:userId", (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ 
            success: false,
            message: "Only companies can connect with users" 
        });
    }
    next();
}, authController.connectWithUser);

router.delete("/connections/:userId", (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({ 
            success: false,
            message: "Only companies can remove connections" 
        });
    }
    next();
}, authController.removeConnection);

module.exports = router;

const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const postController = require("../controllers/post.controller.js");
const connectionController = require("../controllers/connection.controller.js");
const authMiddleware = require("../middleware/auth.middleware");
const blockIPMiddleware = require("../middleware/ipblocker.middleware.js");
const loginSignupLimiter = require("../middleware/ratelimit.middleware.js");
const { upload, handleUploadError } = require("../middleware/upload.middleware");

// Protected routes - require user authentication
router.use(authMiddleware);

// User profile routes
router.get("/profile", (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ 
            success: false,
            message: "Only users can access this route" 
        });
    }
    next();
}, userController.getUserProfile);

router.put("/profile", (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ 
            success: false,
            message: "Only users can access this route" 
        });
    }
    next();
}, userController.updateUserProfile);

router.post("/profile/upload", (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ 
            success: false,
            message: "Only users can access this route" 
        });
    }
    next();
}, upload.single("image"), handleUploadError, userController.uploadProfilePicture);

// User posts
router.post("/posts/upload", (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ 
            success: false,
            message: "Only users can upload posts" 
        });
    }
    next();
}, upload.single("media"), handleUploadError, userController.uploadPost);

// User connections
router.get("/connections", (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ 
            success: false,
            message: "Only users can access connections" 
        });
    }
    next();
}, connectionController.getConnections);

router.post("/connections/:userId", (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ 
            success: false,
            message: "Only users can connect with other users" 
        });
    }
    next();
}, connectionController.connectWithUser);

router.delete("/connections/:userId", (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ 
            success: false,
            message: "Only users can remove connections" 
        });
    }
    next();
}, connectionController.rejectConnection);

// User category
router.put("/category", (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ 
            success: false,
            message: "Only users can update categories" 
        });
    }
    next();
}, userController.updateCategory);

// Account management
router.delete("/account", (req, res, next) => {
    if (req.user.role !== 'user') {
        return res.status(403).json({ 
            success: false,
            message: "Only users can delete accounts" 
        });
    }
    next();
}, userController.deleteAccount);

module.exports = router;

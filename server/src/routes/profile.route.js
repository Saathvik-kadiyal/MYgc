const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const authController = require("../controllers/auth.controller.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const { upload, handleUploadError } = require("../middleware/upload.middleware.js");

// All routes require authentication
router.use(authMiddleware);

// Get profile based on role
router.get("/", (req, res, next) => {
    if (req.user.role === 'user') {
        return userController.getUserProfile(req, res, next);
    } else if (req.user.role === 'company') {
        return authController.getCompanyProfile(req, res, next);
    }
    return res.status(403).json({
        success: false,
        message: "Invalid role"
    });
});

// Update profile based on role
router.put("/", (req, res, next) => {
    if (req.user.role === 'user') {
        return userController.updateUserProfile(req, res, next);
    } else if (req.user.role === 'company') {
        return authController.updateCompanyProfile(req, res, next);
    }
    return res.status(403).json({
        success: false,
        message: "Invalid role"
    });
});

// Upload profile picture based on role
router.post("/upload", upload.single("image"), handleUploadError, (req, res, next) => {
    if (req.user.role === 'user') {
        return userController.uploadProfilePicture(req, res, next);
    } else if (req.user.role === 'company') {
        return authController.uploadProfilePicture(req, res, next);
    }
    return res.status(403).json({
        success: false,
        message: "Invalid role"
    });
});

module.exports = router; 
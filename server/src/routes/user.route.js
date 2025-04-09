const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller.js");
const postController = require("../controllers/post.controller.js");
const authMiddleware = require("../middleware/auth.middleware");
const blockIPMiddleware = require("../middleware/ipblocker.middleware.js");
const loginSignupLimiter = require("../middleware/ratelimit.middleware.js");
const { upload, handleUploadError } = require("../middleware/upload.middleware");

// Post routes - these need to come before parameter routes to prevent conflicts
router.post("/posts/upload", authMiddleware, upload.single("media"), handleUploadError, userController.uploadPost);

// Profile routes
router.post("/profile/upload", authMiddleware, upload.single("image"), handleUploadError, userController.uploadProfilePicture);
router.put("/:id", authMiddleware, userController.editUserProfile);

// Get user profile by username - this should be the last route to prevent conflicts
router.get("/:username", userController.getUserProfile);

module.exports = router;

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware.js");
const postController = require("../controllers/post.controller.js");
const { upload, handleUploadError } = require("../middleware/upload.middleware.js");

// All routes require authentication
router.use(authMiddleware);

// Feed route accessible by both users and companies
router.get("/feed", (req, res, next) => {
    if (!['user', 'company'].includes(req.user.role)) {
        return res.status(403).json({ 
            success: false,
            message: "Only users and companies can view feed" 
        });
    }
    next();
}, postController.getFeedPosts);

// Post voting and deletion routes
router.post("/:postId/vote", (req, res, next) => {
    if (!['user', 'company'].includes(req.user.role)) {
        return res.status(403).json({ 
            success: false,
            message: "Only users and companies can vote on posts" 
        });
    }
    next();
}, postController.votePost);

router.delete("/:id", (req, res, next) => {
    if (!['user', 'company'].includes(req.user.role)) {
        return res.status(403).json({ 
            success: false,
            message: "Only users and companies can delete posts" 
        });
    }
    next();
}, postController.deletePost);

module.exports = router;

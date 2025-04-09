const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware.js");
const postController = require("../controllers/post.controller.js");
const { upload, handleUploadError } = require("../middleware/upload.middleware.js");

// Post voting and feed routes
router.post("/:postId/vote", authMiddleware, postController.votePost);
router.get("/feed", authMiddleware, postController.getFeedPosts);
router.delete("/:id", authMiddleware, postController.deletePost);
//upload


module.exports = router;

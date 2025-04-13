const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const loginSignupLimiter = require('../middleware/ratelimit.middleware');
const blockIPMiddleware = require('../middleware/ipblocker.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

const router = express.Router();

// Public routes
router.post('/signup/initiate', blockIPMiddleware, authController.initiateSignup);
router.post('/signup/verify', blockIPMiddleware, authController.verifySignup);
router.post('/login', loginSignupLimiter, blockIPMiddleware, authController.handleLogin);
router.post('/logout', authController.handleLogout);

module.exports = router;

const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connection.controller.js");
const authMiddleware = require("../middleware/auth.middleware");

// All routes require authentication
router.use(authMiddleware);

// Connect with a user or company
router.post("/connect", (req, res, next) => {
    if (!['user', 'company'].includes(req.user.role)) {
        return res.status(403).json({ 
            success: false,
            message: "Only users and companies can connect" 
        });
    }
    next();
}, connectionController.connectWithUser);

// Accept a connection request
router.put("/accept/:connectionId", (req, res, next) => {
    if (!['user', 'company'].includes(req.user.role)) {
        return res.status(403).json({ 
            success: false,
            message: "Only users and companies can accept connections" 
        });
    }
    next();
}, connectionController.acceptConnection);

// Reject a connection request
router.put("/reject/:connectionId", (req, res, next) => {
    if (!['user', 'company'].includes(req.user.role)) {
        return res.status(403).json({ 
            success: false,
            message: "Only users and companies can reject connections" 
        });
    }
    next();
}, connectionController.rejectConnection);

// Get all connections for the authenticated user
router.get("/", (req, res, next) => {
    if (!['user', 'company'].includes(req.user.role)) {
        return res.status(403).json({ 
            success: false,
            message: "Only users and companies can view connections" 
        });
    }
    next();
}, connectionController.getConnections);

module.exports = router;

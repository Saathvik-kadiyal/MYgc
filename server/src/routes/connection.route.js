const express = require("express");
const router = express.Router();
const connectionController = require("../controllers/connection.controller.js");
const authMiddleware = require("../middleware/auth.middleware");

// All routes require authentication
router.use(authMiddleware);

// Connect with a user or company
router.post("/connect", connectionController.connectWithUser);

// Accept a connection request
router.put("/accept/:connectionId", connectionController.acceptConnection);

// Reject a connection request
router.put("/reject/:connectionId", connectionController.rejectConnection);

// Get all connections for the authenticated user
router.get("/", connectionController.getConnections);

module.exports = router;

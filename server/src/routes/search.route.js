const express = require("express");
const router = express.Router();
const searchController = require("../controllers/search.controller.js");
const authMiddleware = require("../middleware/auth.middleware");

// All search routes require authentication
router.use(authMiddleware);

// Search freshers
router.get("/freshers", searchController.searchFreshers);

// Search brands
router.get("/brands", searchController.searchBrands);

// Search experienced users
router.get("/experienced", searchController.searchExperiencedUsers);

module.exports = router; 
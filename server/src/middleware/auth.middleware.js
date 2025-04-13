const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Company = require('../models/company.model');
const { JWT_SECRET } = require('../config/jwt.js');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.auth_token;
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Authentication required" 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user data based on role
        let user;
        if (decoded.role === 'user') {
            user = await User.findById(decoded.id)
                .populate('category', 'type experience');
        } else if (decoded.role === 'company') {
            user = await Company.findById(decoded.id)
                .populate('category', 'type description employeeCount');
        } else {
            return res.status(401).json({ 
                success: false,
                message: "Invalid role in token" 
            });
        }

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "User not found" 
            });
        }

        // Attach user data to request - matching controller response structure
        req.user = {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            category: user.category
        };

        // Add role-specific data
        if (user.role === 'user') {
            req.user.interestedCategories = user.interestedCategories;
            req.user.socialMediaLinks = user.socialMediaLinks;
            req.user.location = user.location;
            req.user.connectionsCount = user.connectionsCount;
            req.user.appliedJobs = user.appliedJobs;
        } else if (user.role === 'company') {
            req.user.phoneNumber = user.phoneNumber;
            req.user.jobPostings = user.jobPostings;
        }

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: "Invalid or expired token" 
            });
        }
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: error.message 
        });
    }
};

module.exports = authMiddleware;

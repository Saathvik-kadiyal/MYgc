const User = require('../models/user.model.js');
const { comparePassword } = require('../config/bcrypt.js');
const { verifyToken } = require('../config/jwt.js');

const authMiddleware = async (req, res, next) => {
    try {
        // First try cookie-based authentication
        const token = req.cookies.auth_token;
        
        if (token) {
            const { valid, expired, decoded } = verifyToken(token);
            if (!valid) {
                return res.status(401).json({ message: expired ? "Token has expired" : "Invalid token" });
            }

            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }

            req.user = user;
            return next();
        }

        // If no cookie, try manual email & password authentication
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(401).json({ message: "Authentication required" });
        }

        const user = await User.findOne({ email });
        if (!user || !user.password || !(await comparePassword(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: "Authentication failed", error: error.message });
    }
};

module.exports = authMiddleware;

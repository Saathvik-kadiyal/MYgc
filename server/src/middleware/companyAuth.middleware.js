const Company = require('../models/company.model.js');
const { comparePassword } = require('../config/bcrypt.js');
const { verifyToken } = require('../config/jwt.js');

const companyAuthMiddleware = async (req, res, next) => {
    try {
        // JWT Authentication (Bearer Token)
        if (req.headers.authorization?.startsWith("Bearer ")) {
            const token = req.headers.authorization.split(" ")[1];

            const { valid, expired, decoded } = verifyToken(token);
            if (!valid) {
                return res.status(401).json({ message: expired ? "Token has expired" : "Invalid token" });
            }

            const company = await Company.findById(decoded.id);
            if (!company) {
                return res.status(401).json({ message: "Company not found or token invalid" });
            }

            req.company = company;
            return next();
        }

        // Manual Email & Password Authentication
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }

        const company = await Company.findOne({ email });
        if (!company || !company.password || !(await comparePassword(password, company.password))) {
            return res.status(401).json({ message: "Invalid credentials." });
        }

        req.company = company;
        next();
    } catch (error) {
        res.status(500).json({ message: "Authentication failed", error: error.message });
    }
};

module.exports = companyAuthMiddleware; 
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

const generateToken = (user) => {
    try {
        if (!user || !user._id || !user.email) {
            throw new Error('Invalid user data for token generation');
        }

        const payload = {
            id: user._id,
            email: user.email,
            isCompany: !!user.role,
            role: user.role || undefined,
            type: user.type || undefined
        };
        console.log(payload)

        return jwt.sign(payload, SECRET_KEY);
    } catch (error) {
        console.error('Error generating token:', error);
        throw error;
    }
};

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        return { valid: true, expired: false, decoded };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, expired: true, decoded: null };
        }
        return { valid: false, expired: false, decoded: null };
    }
};

module.exports = { generateToken, verifyToken };

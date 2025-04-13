const BlockedIP = require('../models/block.model.js');

/**
 * Normalizes an IP address to a consistent format
 * @param {string} ip - The IP address to normalize
 * @returns {string} - The normalized IP address
 */
const normalizeIP = (ip) => {
    if (!ip) return 'unknown';

    // Handle IPv6 addresses
    if (ip.includes(':')) {
        // If it's an IPv4-mapped IPv6 address (::ffff:192.168.1.1), extract the IPv4 part
        if (ip.startsWith('::ffff:')) {
            return ip.substring(7);
        }
        // Otherwise normalize IPv6 to lowercase
        return ip.toLowerCase();
    }
    
    // For regular IPv4 addresses, just return as is
    return ip;
};

/**
 * Gets the client IP from the request
 * @param {Object} req - Express request object
 * @returns {string} - Normalized IP address
 */
const getClientIP = (req) => {
    // Check X-Forwarded-For header first (common when behind a proxy)
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
        const ips = forwardedFor.split(',').map(ip => ip.trim());
        return normalizeIP(ips[0]);
    }

    // Try other common headers and properties
    return normalizeIP(
        req.headers['x-real-ip'] || 
        req.ip || 
        req.connection?.remoteAddress
    );
};

const blockIPMiddleware = async (req, res, next) => {
    try {
        // Get client IP
        const clientIP = req.ip || req.connection.remoteAddress;
        
        // Check if IP is blocked
        const isBlocked = await BlockedIP.findOne({ ip: clientIP });
        
        if (isBlocked) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Your IP has been blocked due to suspicious activity."
            });
        }

        next();
    } catch (error) {
        console.error("IP blocker middleware error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = blockIPMiddleware;

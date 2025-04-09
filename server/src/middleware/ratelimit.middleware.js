const rateLimit = require('express-rate-limit');

// Limit 3 attempts per 10 minutes
const loginSignupLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 3, // Limit each IP to 3 requests per windowMs
    message: { error: "Too many attempts, please try again after 10 minutes." },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false // Disable the `X-RateLimit-*` headers
});

module.exports = loginSignupLimiter;

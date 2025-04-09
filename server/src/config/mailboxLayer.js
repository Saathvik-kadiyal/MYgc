require('dotenv').config();
const axios = require('axios');
const API_KEY = process.env.MAILBOXLAYER_API_KEY;
const BlockedIP = require('../models/block.model.js');

const checkEmailValidity = async (email, userIP) => {
    try {
        const { data } = await axios.get(`https://api.apilayer.com/email_verification/check`, {
            params: { access_key: API_KEY, email }
        });

        if (data.disposable) {
            // Block the IP and email
            await BlockedIP.create({ ip: userIP, email, reason: "Disposable email used" });
            return { valid: false, reason: "Disposable email addresses are not allowed. Your IP has been blocked." };
        }

        return { valid: true };
    } catch (error) {
        console.error("Email validation error:", error.response ? error.response.data : error.message);
        return { valid: false, reason: "Email validation service unavailable." };
    }
};

module.exports = { checkEmailValidity };

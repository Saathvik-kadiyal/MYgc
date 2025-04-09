require('dotenv').config();
const nodemailer = require('nodemailer');

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD // Use an App Password, not your regular Gmail password
    }
});


// Verify the connection configuration
transporter.verify(function(error, success) {
    if (error) {
        console.log("SMTP connection error:", error);
    } else {
        console.log("SMTP server is ready to take our messages");
    }
});

const sendEmail = async (to, subject, text) => {
    try {
        // For development/testing, also log the email details
        console.log(`[EMAIL SENT] To: ${to}, Subject: ${subject}, Text: ${text}`);
        
        // Send the actual email
        await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: to,
            subject: subject,
            text: text
        });
        
        return true;
    } catch (error) {
        console.error("Email sending error:", error);
        return false;
    }
};

module.exports = { sendEmail };

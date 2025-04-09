const express = require('express');
const { checkEmailValidity } = require('../config/mailboxLayer');
const { sendEmail } = require('../config/smtp');
const { generateOTP, verifyOTP } = require('../config/otp');
const { hashPassword, comparePassword } = require('../config/bcrypt');
const { generateToken } = require('../config/jwt');
const User = require('../models/user.model');
const authMiddleware = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');
const blockIPMiddleware = require('../middleware/ipblocker.middleware');
const loginSignupLimiter = require('../middleware/ratelimit.middleware');

const router = express.Router();

// Signup routes
router.post('/signup/initiate', loginSignupLimiter, blockIPMiddleware, authController.initiateSignup);
router.post('/signup/verify', authController.verifySignup);

// 📩 Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    const emailData = await checkEmailValidity(email);
    if (!emailData?.smtp_check) {
        return res.status(400).json({ message: "Invalid email address." });
    }

    const otp = generateOTP(email);
    const sent = await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);

    if (!sent) {
        return res.status(500).json({ message: "Failed to send OTP." });
    }

    res.json({ message: "OTP sent successfully!" });
});

// 📝 Register with OTP
router.post('/register', async (req, res) => {
    const { email, otp, username, password } = req.body;

    if (!verifyOTP(email, otp)) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    if (await User.findOne({ email })) {
        return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await hashPassword(password);
    const user = await new User({ email, username, password: hashedPassword }).save();

    const token = generateToken(user);
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
    });

    res.json({ 
        message: "User registered successfully!",
        user: {
            id: user._id,
            email: user.email,
            username: user.username
        }
    });
});

// 🔐 Login with Email & Password
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = generateToken(user);
    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/'
    });

    res.json({ 
        message: "Login successful",
        user: {
            id: user._id,
            email: user.email,
            username: user.username
        }
    });
});

// 👤 Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Populate the category field
        await user.populate('category');
        
        // Populate connections
        await user.populate('connections', 'username profilePicture');
        
        // Populate posts with all necessary fields
        await user.populate({
            path: 'posts',
            select: 'media mediaType caption upvotes downvotes upvotedBy downvotedBy createdAt owner',
            options: { sort: { createdAt: -1 } }
        });
        
        // Populate post owners
        await user.populate({
            path: 'posts.owner',
            select: 'username profilePicture'
        });
        
        // Ensure posts are properly formatted
        if (user.posts && user.posts.length > 0) {
            user.posts = user.posts.map(post => {
                // Ensure upvotedBy and downvotedBy are arrays
                if (!post.upvotedBy) post.upvotedBy = [];
                if (!post.downvotedBy) post.downvotedBy = [];
                
                // Ensure owner is properly set
                if (!post.owner) {
                    post.owner = {
                        _id: user._id,
                        username: user.username,
                        profilePicture: user.profilePicture
                    };
                }
                
                return post;
            });
        }
        
        res.json(user);
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({ message: error.message });
    }
});

// 🚪 Logout
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    });
    res.json({ message: "Logged out successfully" });
});

module.exports = router;

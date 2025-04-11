const express = require('express');
const { checkEmailValidity } = require('../config/mailboxLayer');
const { sendEmail } = require('../config/smtp');
const { generateOTP, verifyOTP } = require('../config/otp');
const { hashPassword, comparePassword } = require('../config/bcrypt');
const { generateToken } = require('../config/jwt');
const User = require('../models/user.model');
const Company = require('../models/company.model')
const authMiddleware = require('../middleware/auth.middleware');
const companyAuthMiddleware = require('../middleware/companyAuth.middleware');
const authController = require('../controllers/auth.controller');
const companyAuthController = require('../controllers/companyAuth.controller');
const blockIPMiddleware = require('../middleware/ipblocker.middleware');
const loginSignupLimiter = require('../middleware/ratelimit.middleware');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

const router = express.Router();

// User auth routes
router.post('/signup/initiate', loginSignupLimiter, blockIPMiddleware, authController.initiateSignup);
router.post('/signup/verify', authController.verifySignup);

// Company auth routes (signup only)
router.post('/company/signup/initiate', loginSignupLimiter, blockIPMiddleware, companyAuthController.initiateCompanySignup);
router.post('/company/signup/verify', companyAuthController.verifyCompanySignup);

// Company profile routes
router.get('/company/profile', companyAuthMiddleware, companyAuthController.getCompanyProfile);
router.put('/company/profile', companyAuthMiddleware, companyAuthController.updateCompanyProfile);
router.post('/company/profile/upload', companyAuthMiddleware, upload.single("image"), handleUploadError, companyAuthController.uploadProfilePicture);

// 📩 Send OTP
router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    const emailData = await checkEmailValidity(email);
    if (!emailData?.smtp_check) {
        return res.status(400).json({ message: "Invalid email address." });
    }

    const otp = generateOTP(email, 'user');
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
        return res.status(400).json({ 
            success: false,
            message: "Invalid or expired OTP",
            error: "OTP verification failed",
            email,
            accountType: "user" 
        });
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
    try {
        const { email, password } = req.body;

        // First try to find user
        let account = await User.findOne({ email }).select('+password');
        let accountType = 'user';

        // If user not found, try company
        if (!account) {
            account = await Company.findOne({ email }).select('+password');
            accountType = 'company';
        }

        // If neither found or password doesn't match
        if (!account || !(await comparePassword(password, account.password))) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid credentials",
                error: "INVALID_CREDENTIALS"
            });
        }

        // Generate token with account type
        const token = generateToken({
            id: account._id,
            email: account.email,
            role: account.role
        });

        // Set secure cookie
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/'
        });

        // Return response matching client expectations
        const responseData = {
            success: true,
            message: "Login successful",
            token, // Include token in response for client storage
            user: {
                id: account._id,
                email: account.email,
                username: account.username,
                ...(accountType === 'company' && { role: account.role })
            },
            isCompany: accountType === 'company'
        };

        res.json(responseData);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
});

// 👤 Get user profile
// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        let profile;
        
        // Check if user has company role
        if (req.user.role === 'company') {
            const Company = require('../models/company.model');
            profile = await Company.findById(req.user.id).select('-password');
        } else {
            profile = await User.findById(req.user.id).select('-password');
        }

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        
        // Only populate user-specific fields if not a company
        if (req.user.role !== 'company') {
            // Populate the category field
            await profile.populate('category');
            
            // Populate connections
            await profile.populate('connections', 'username profilePicture');
            
            // Populate posts with all necessary fields
            await profile.populate({
                path: 'posts',
                select: 'media mediaType caption upvotes downvotes upvotedBy downvotedBy createdAt owner',
                options: { sort: { createdAt: -1 } }
            });
            
            // Populate post owners
            await profile.populate({
                path: 'posts.owner',
                select: 'username profilePicture'
            });
            
            // Ensure posts are properly formatted
            if (profile.posts && profile.posts.length > 0) {
                profile.posts = profile.posts.map(post => {
                    // Ensure upvotedBy and downvotedBy are arrays
                    if (!post.upvotedBy) post.upvotedBy = [];
                    if (!post.downvotedBy) post.downvotedBy = [];
                    
                    // Ensure owner is properly set
                    if (!post.owner) {
                        post.owner = {
                            _id: profile._id,
                            username: profile.username,
                            profilePicture: profile.profilePicture
                        };
                    }
                    
                    return post;
                });
            }
        }
        
        res.json(profile);
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

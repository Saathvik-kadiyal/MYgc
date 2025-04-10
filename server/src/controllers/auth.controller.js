const User = require('../models/user.model.js');
const Company = require('../models/company.model.js');
const { hashPassword, comparePassword } = require('../config/bcrypt.js');
const { generateToken } = require('../config/jwt.js');
const { generateOTP, verifyOTP } = require('../config/otp.js');
const { sendEmail } = require('../config/smtp.js');
const cookieOptions = require('../config/cookie.js');

// Store temporary user data during OTP verification with cleanup mechanism
const tempUserStore = new Map();
const OTP_EXPIRY = 30 * 60 * 1000; // 30 minutes

// Cleanup function to remove expired entries
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of tempUserStore.entries()) {
        if (now - data.timestamp > OTP_EXPIRY) {
            tempUserStore.delete(email);
        }
    }
}, 5 * 60 * 1000); // Run cleanup every 5 minutes

exports.initiateSignup = async (req, res) => {
    try {
        const { email, username, password, phoneNumber, type } = req.body;

        // Validate required fields
        if (!email || !username || !password || !phoneNumber || !type) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if user already exists
        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate OTP
        const otp = generateOTP(email);
        
        // Send OTP via email
        const emailSent = await sendEmail(
            email, 
            "Verify Your Email", 
            `Your verification code is: ${otp}. This code will expire in 30 minutes.`
        );
        
        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send verification email" });
        }
        
        // Store user data temporarily with timestamp
        tempUserStore.set(email, {
            email,
            username,
            password,
            phoneNumber,
            type,
            timestamp: Date.now()
        });
        
        res.status(200).json({ 
            message: "Verification code sent to your email",
            email: email
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifySignup = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        // Verify OTP
        if (!verifyOTP(email, otp)) {
            return res.status(400).json({ message: "Invalid or expired verification code" });
        }
        
        // Get temporary user data
        const userData = tempUserStore.get(email);
        if (!userData) {
            return res.status(400).json({ message: "Signup session expired. Please try again." });
        }
        
        // Check if the temporary data is too old
        if (Date.now() - userData.timestamp > OTP_EXPIRY) {
            tempUserStore.delete(email);
            return res.status(400).json({ message: "Signup session expired. Please try again." });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(userData.password);
        
        // Create category
        const Category = require('../models/category.model.js');
        const category = new Category({
            type: userData.type === 'experienced' ? 'experienced' : 'fresher',
            experience: userData.type === 'experienced' ? 1 : 0,
            proof: []
        });
        
        await category.save();
        
        // Create user
        const newUser = new User({
            email: userData.email,
            username: userData.username,
            password: hashedPassword,
            phoneNumber: userData.phoneNumber,
            category: category._id,
            type: userData.type
        });
        
        await newUser.save();
        
        // Generate JWT token
        const token = generateToken(newUser);
        
        // Clean up temporary data
        tempUserStore.delete(email);
        
        // Set token in HTTP-only cookie
        res.cookie('auth_token', token, cookieOptions);
        
        // Return user data without sensitive information
        const userResponse = {
            id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            phoneNumber: newUser.phoneNumber,
            type: newUser.type,
            category: {
                type: category.type,
                experience: category.experience
            }
        };
        
        res.status(201).json({ 
            message: "User registered successfully",
            user: userResponse
        });
    } catch (error) {
        console.error("Error in verifySignup:", error);
        res.status(500).json({ message: "Server error during signup verification", error: error.message });
    }
};

exports.handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        // Check both User and Company collections
        const [user, company] = await Promise.all([
            User.findOne({ email }).populate('category'),
            Company.findOne({ email })
        ]);
        
        const account = user || company;
        if (!account) {
            return res.status(404).json({ message: "Account not found with this email" });
        }
        
        // Verify password
        const isPasswordValid = await comparePassword(password, account.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = generateToken(account);
        
        // Set token in HTTP-only cookie
        res.cookie('auth_token', token, cookieOptions);
        
        // Return appropriate response based on account type
        if (user) {
            const userResponse = {
                id: user._id,
                email: user.email,
                username: user.username,
                phoneNumber: user.phoneNumber,
                type: user.type,
                category: user.category ? {
                    type: user.category.type,
                    experience: user.category.experience
                } : null,
                isCompany: false
            };
            res.status(200).json({
                message: "Login successful",
                user: userResponse
            });
        } else {
            const companyResponse = {
                id: company._id,
                email: company.email,
                username: company.username,
                role: company.role,
                isCompany: true
            };
            res.status(200).json({
                message: "Login successful",
                user: companyResponse
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
        .select('-password')
        .populate({
          path: 'category',
          select: 'type experience' // ⬅️ make this explicit
        })
        .populate('connections', 'username profilePicture')
        .populate({
          path: 'posts',
          select: 'media mediaType caption upvotes downvotes upvotedBy downvotedBy createdAt owner',
          options: { sort: { createdAt: -1 } }
        })
        .populate({
          path: 'posts.owner',
          select: 'username profilePicture'
        });
       

        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        
        
        // Format user data for response
        const userResponse = {
            id: user._id,
            email: user.email,
            username: user.username,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            category: user.category ? {
              type: user.category.type,
              experience: user.category.experience
            } : null,
            connections: user.connections,
            posts: user.posts.map(post => ({
              ...post.toObject(),
              upvotedBy: post.upvotedBy || [],
              downvotedBy: post.downvotedBy || []
            }))
          };
          
        
        res.status(200).json(userResponse);
    } catch (error) {
        console.error("Error in getUserProfile:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.handleLogout = async (req, res) => {
    try {
        // Clear the auth cookie
        res.clearCookie('auth_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/'
        });
        
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
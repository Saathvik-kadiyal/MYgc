const User = require('../models/user.model.js');
const { hashPassword, comparePassword } = require('../config/bcrypt.js');
const { generateToken } = require('../config/jwt.js');
const { generateOTP, verifyOTP } = require('../config/otp.js');
const { sendEmail } = require('../config/smtp.js');

// Store temporary user data during OTP verification
const tempUserStore = new Map();

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/'
};

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
            `Your verification code is: ${otp}. This code will expire in 10 minutes.`
        );
        
        if (!emailSent) {
            return res.status(500).json({ message: "Failed to send verification email" });
        }
        
        // Store user data temporarily
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
        
        // Check if the temporary data is too old (e.g., 30 minutes)
        if (Date.now() - userData.timestamp > 30 * 60 * 1000) {
            tempUserStore.delete(email);
            return res.status(400).json({ message: "Signup session expired. Please try again." });
        }
        
        console.log("User data:", userData);
        
        // Hash password
        const hashedPassword = await hashPassword(userData.password);
        
        // Create category
        const Category = require('../models/category.model.js');
        
        // Map user type to valid category type
        let categoryType = 'fresher';
        if (userData.type === 'experienced') {
            categoryType = 'experienced';
        }
        
        console.log("Category type:", categoryType);
        
        const category = new Category({
            type: categoryType,
            experience: categoryType === 'experienced' ? 1 : 0,
            proof: []
        });
        
        try {
            await category.save();
            console.log("Category saved successfully:", category);
        } catch (categoryError) {
            console.error("Error creating category:", categoryError);
            return res.status(500).json({ message: "Error creating user category", error: categoryError.message });
        }
        
        // Create user
        const newUser = new User({
            email: userData.email,
            username: userData.username,
            password: hashedPassword,
            phoneNumber: userData.phoneNumber,
            category: category._id
        });
        
        console.log("New user data:", newUser);
        
        try {
            await newUser.save();
            console.log("User saved successfully:", newUser);
        } catch (userError) {
            console.error("Error creating user:", userError);
            return res.status(500).json({ message: "Error creating user", error: userError.message });
        }
        
        // Generate JWT token
        const token = generateToken(newUser);
        
        // Clean up temporary data
        tempUserStore.delete(email);
        
        // Set token in HTTP-only cookie
        res.cookie('auth_token', token, cookieOptions);
        
        res.status(201).json({ 
            message: "User registered successfully",
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                phoneNumber: newUser.phoneNumber
            }
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
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found with this email" });
        }
        
        // Verify password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = generateToken(user);
        
        // Set token in HTTP-only cookie
        res.cookie('auth_token', token, cookieOptions);
        
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                phoneNumber: user.phoneNumber,
                type: user.type
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUserProfile = async (req, res) => {
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
        
        res.status(200).json(user);
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

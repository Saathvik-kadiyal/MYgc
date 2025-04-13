const User = require('../models/user.model');
const Company = require('../models/company.model');
const Category = require('../models/category.model');
const CompanyCategory = require('../models/companyCategory.model');
const { hashPassword, comparePassword } = require('../config/bcrypt.js');
const { generateToken } = require('../config/jwt.js');
const { generateOTP, verifyOTP } = require('../config/otp.js');
const { sendEmail } = require('../config/smtp.js');
const { checkEmailValidity } = require('../config/mailboxLayer.js');
const cookieOptions = require('../config/cookie.js');

// Store temporary data during OTP verification
const tempStore = new Map();
const OTP_EXPIRY = 30 * 60 * 1000; // 30 minutes

// Cleanup function to remove expired entries
setInterval(() => {
    const now = Date.now();
    for (const [email, data] of tempStore.entries()) {
        if (now - data.timestamp > OTP_EXPIRY) {
            tempStore.delete(email);
        }
    }
}, 5 * 60 * 1000);

// Validation
const validateEmail = async (email, ip) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: "Invalid email format" };
    }

    const emailValidation = await checkEmailValidity(email, ip);
    if (!emailValidation.valid) {
        return { valid: false, message: emailValidation.reason };
    }

    return { valid: true };
};

const validatePassword = (password) => {
    if (password.length < 8) {
        return { valid: false, message: "Password must be at least 8 characters long" };
    }
    return { valid: true };
};

// INITIATE SIGNUP
exports.initiateSignup = async (req, res) => {
    try {
        const { email, username, password, phoneNumber, type, role, category } = req.body;

        if (!role || !['user', 'company'].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role specified. Must be either 'user' or 'company'" });
        }

        if (role === 'user') {
            if (!email || !username || !password || !phoneNumber || !type) {
                return res.status(400).json({ success: false, message: "All fields are required for user signup" });
            }
            if (!['experienced', 'fresher'].includes(type)) {
                return res.status(400).json({ success: false, message: "Invalid type specified for user" });
            }
        } else if (role === 'company') {
            if (!email || !username || !password || !category || !phoneNumber) {
                return res.status(400).json({ success: false, message: "All fields are required for company signup" });
            }

            const validCategory = await CompanyCategory.findById(category);
            if (!validCategory) {
                return res.status(400).json({ success: false, message: "Invalid company category" });
            }
        }

        const emailValidation = await validateEmail(email, req.ip);
        if (!emailValidation.valid) {
            return res.status(400).json({ success: false, message: emailValidation.message });
        }

        const existingUser = await User.findOne({ email });
        const existingCompany = await Company.findOne({ email });

        if (existingUser || existingCompany) {
            return res.status(400).json({ success: false, message: "Email already registered in either User or Company" });
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ success: false, message: passwordValidation.message });
        }

        

        const otp = generateOTP(email);

        const emailSent = await sendEmail(
            email,
            "Verify Your Email",
            `Your verification code is: ${otp}. This code will expire in 30 minutes.`
        );

        if (!emailSent) {
            return res.status(500).json({ success: false, message: "Failed to send verification email" });
        }

        tempStore.set(email, {
            email,
            username,
            password,
            phoneNumber,
            type,
            role,
            category,
            timestamp: Date.now()
        });

        res.status(200).json({
            success: true,
            message: "Verification code sent to your email",
            email
        });

    } catch (error) {
        console.error("Signup initiation error:", error);
        res.status(500).json({ success: false, message: "Server error during signup", error: error.message });
    }
};

// VERIFY SIGNUP
exports.verifySignup = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: "Email and OTP are required" });
        }

        const otpVerification = verifyOTP(email, otp);
        if (!otpVerification.valid) {
            return res.status(400).json({
                success: false,
                message: otpVerification.reason === 'expired' ? "Verification code has expired" : "Invalid verification code",
                error: otpVerification.reason === 'expired' ? "OTP_EXPIRED" : "INVALID_OTP"
            });
        }

        const data = tempStore.get(email);
        if (!data || (Date.now() - data.timestamp > OTP_EXPIRY)) {
            tempStore.delete(email);
            return res.status(400).json({ success: false, message: "Signup session expired. Please try again." });
        }

        const hashedPassword = await hashPassword(data.password);

        let newUser;
        let token;

        if (data.role === 'user') {
            const category = new Category({
                type: data.type,
                experience: data.type === 'experienced' ? 1 : 0,
                proof: []
            });
            await category.save();

            newUser = new User({
                email: data.email,
                username: data.username,
                password: hashedPassword,
                phoneNumber: data.phoneNumber,
                role: 'user',
                category: category._id,
                interestedCategories: [],
                socialMediaLinks: [],
                location: { city: '', country: '' },
                connectionsCount: 0,
                connections: [],
                notifications: [],
                posts: [],
                appliedJobs: []
            });
            await newUser.save();

            token = generateToken({
                id: newUser._id,
                email: newUser.email,
                role: 'user'
            });
        } else if (data.role === 'company') {
            const companyCategory = await CompanyCategory.findById(data.category);
            if (!companyCategory) {
                return res.status(400).json({ success: false, message: "Invalid company category" });
            }

            newUser = new Company({
                email: data.email,
                username: data.username,
                password: hashedPassword,
                role: 'company',
                category: data.category,
                phoneNumber: data.phoneNumber || null,
                jobPostings: [],
                connections: [],
                notifications: []
            });
            await newUser.save();

            token = generateToken({
                id: newUser._id,
                email: newUser.email,
                role: 'company'
            });
        }

        tempStore.delete(email);

        res.cookie('auth_token', token, cookieOptions);

        const response = {
            success: true,
            message: `${data.role} registered successfully`,
            [data.role]: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                role: data.role
            },
            token,
            redirectUrl: '/feed'
        };

        if (data.role === 'user') {
            response.user.category = {
                type: newUser.category.type,
                experience: newUser.category.experience
            };
        } else if (data.role === 'company') {
            response.company.category = {
                type: companyCategory.type,
                description: companyCategory.description
            };
        }

        res.status(201).json(response);

    } catch (error) {
        console.error("Signup verification error:", error);
        res.status(500).json({ success: false, message: "Server error during signup verification", error: error.message });
    }
};

// LOGIN
exports.handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        let user;
        if (email.includes('@company.com')) {
            user = await Company.findOne({ email }).select('+password').populate('category', 'type description');
        } else {
            user = await User.findOne({ email }).select('+password').populate('category', 'type experience');
        }

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        const token = generateToken({
            id: user._id,
            email: user.email
        });

        res.cookie('auth_token', token, cookieOptions);

        const response = {
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                email: user.email,
                username: user.username
            },
            token,
            redirectUrl: '/feed'
        };

        if (user.role === 'user' && user.category) {
            response.user.category = {
                type: user.category.type,
                experience: user.category.experience
            };
        } else if (user.role === 'company' && user.category) {
            response.company.category = {
                type: user.category.type,
                description: user.category.description
            };
        }

        res.status(200).json(response);

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// LOGOUT
exports.handleLogout = async (req, res) => {
    try {
        res.clearCookie('auth_token', cookieOptions);
        res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// COMPANY PROFILE
exports.getCompanyProfile = async (req, res) => {
    try {
        const company = await Company.findById(req.user.id)
            .populate('category', 'type description')
            .populate('jobPostings')
            .populate('connections', 'username email profilePicture');

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.status(200).json({
            success: true,
            company: {
                id: company._id,
                email: company.email,
                username: company.username,
                profilePicture: company.profilePicture,
                category: company.category,
                jobPostings: company.jobPostings,
                connections: company.connections,
                connectionsCount: company.connections.length
            }
        });
    } catch (error) {
        console.error("Get company profile error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.updateCompanyProfile = async (req, res) => {
    try {
        const { username, phoneNumber, category } = req.body;
        const updates = {};

        if (username) updates.username = username;
        if (phoneNumber) updates.phoneNumber = phoneNumber;
        if (category) {
            const validCategory = await CompanyCategory.findById(category);
            if (!validCategory) {
                return res.status(400).json({ success: false, message: "Invalid company category" });
            }
            updates.category = category;
        }

        const company = await Company.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { new: true }
        ).populate('category', 'type description');

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            company: {
                id: company._id,
                email: company.email,
                username: company.username,
                profilePicture: company.profilePicture,
                category: company.category,
                phoneNumber: company.phoneNumber
            }
        });
    } catch (error) {
        console.error("Update company profile error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No image file provided" });
        }

        const company = await Company.findByIdAndUpdate(
            req.user.id,
            { $set: { profilePicture: req.file.path } },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.status(200).json({
            success: true,
            message: "Profile picture uploaded successfully",
            profilePicture: company.profilePicture
        });
    } catch (error) {
        console.error("Upload profile picture error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// COMPANY CONNECTIONS
exports.getConnections = async (req, res) => {
    try {
        const company = await Company.findById(req.user.id)
            .populate('connections', 'username email profilePicture');

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        res.status(200).json({
            success: true,
            connections: company.connections,
            connectionsCount: company.connections.length
        });
    } catch (error) {
        console.error("Get connections error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.connectWithUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const company = await Company.findById(req.user.id);
        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        if (company.connections.includes(userId)) {
            return res.status(400).json({ success: false, message: "Already connected with this user" });
        }

        company.connections.push(userId);
        await company.save();

        res.status(200).json({
            success: true,
            message: "Connected with user successfully",
            connection: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error("Connect with user error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

exports.removeConnection = async (req, res) => {
    try {
        const { userId } = req.params;
        const company = await Company.findById(req.user.id);

        if (!company) {
            return res.status(404).json({ success: false, message: "Company not found" });
        }

        if (!company.connections.includes(userId)) {
            return res.status(400).json({ success: false, message: "Not connected with this user" });
        }

        company.connections = company.connections.filter(id => id.toString() !== userId);
        await company.save();

        res.status(200).json({
            success: true,
            message: "Connection removed successfully"
        });
    } catch (error) {
        console.error("Remove connection error:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};



const Company = require('../models/company.model.js');
const { hashPassword, comparePassword } = require('../config/bcrypt.js');
const { generateToken } = require('../config/jwt.js');
const { generateOTP, verifyOTP } = require('../config/otp.js');
const { sendEmail } = require('../config/smtp.js');

// Store temporary company data during OTP verification
const tempCompanyStore = new Map();

// Cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
};

exports.initiateCompanySignup = async (req, res) => {
    try {
        const { email, username, password, role } = req.body;
        
        // Validate required fields
        if (!email || !username || !password || !role) {
            return res.status(400).json({ 
                success: false, 
                message: "Email, username, password, and role are required" 
            });
        }
        
        // Check if company already exists
        const existingCompany = await Company.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingCompany) {
            return res.status(400).json({ 
                success: false, 
                message: "Email or username already registered" 
            });
        }
        
        // Generate OTP
        const otp = generateOTP(email);
        
        // Send OTP via email
        const emailSent = await sendEmail(
            email, 
            "Verify your email for UGC Platform", 
            `Your verification code is: ${otp}. This code will expire in 5 minutes.`
        );
        
        if (!emailSent) {
            return res.status(500).json({ 
                success: false, 
                message: "Failed to send verification email" 
            });
        }
        
        // Store company data temporarily
        tempCompanyStore.set(email, {
            email,
            username,
            password,
            role,
            otp, // Store the generated OTP with company data
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });
        
        res.status(200).json({ 
            success: true, 
            message: "Verification code sent to your email" 
        });
    } catch (error) {
        console.error("Company signup error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error during company signup", 
            error: error.message 
        });
    }
};

exports.verifyCompanySignup = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and OTP are required" 
            });
        }
        
        // Get company data from temporary store first
        const companyData = tempCompanyStore.get(email);
        if (!companyData) {
            return res.status(400).json({ 
                success: false, 
                message: "No signup session found. Please start signup again." 
            });
        }

        // Verify OTP using the centralized OTP store
        if (!verifyOTP(email, otp)) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid or expired verification code",
                error: "OTP verification failed",
                email,
                accountType: "company"
            });
        }
        
        if (companyData.expiresAt < Date.now()) {
            tempCompanyStore.delete(email);
            return res.status(400).json({ 
                success: false, 
                message: "Signup session expired. Please try again.",
                details: {
                    email,
                    expiresAt: new Date(companyData.expiresAt).toISOString(),
                    currentTime: new Date().toISOString()
                }
            });
        }
        
        // Hash password
        const hashedPassword = await hashPassword(companyData.password);
        
        // Create company
        const newCompany = new Company({
            email: companyData.email,
            username: companyData.username,
            password: hashedPassword,
            role: companyData.role,
            phoneNumber: companyData.phoneNumber || '', // Add phoneNumber with fallback
            jobPostings: [],
            connections: [],
            notifications: []
        });
        
        await newCompany.save();
        
        // Generate JWT token
        const token = generateToken(newCompany);
        
        // Clean up temporary data
        tempCompanyStore.delete(email);
        
        // Set token in HTTP-only cookie
        res.cookie('auth_token', token, cookieOptions);
        
        res.status(201).json({ 
            success: true,
            message: "Company registered successfully",
            user: {  // Changed from 'company' to 'user' to match authSlice expectations
                id: newCompany._id,
                email: newCompany.email,
                username: newCompany.username,
                role: newCompany.role
            },
            token  // Include the token in response
        });
    } catch (error) {
        console.error('Company verification failed:', {
            email: req.body.email,
            otp: req.body.otp,
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false,
            message: "Error during company verification", 
            error: error.message,
            email: req.body.email,
            accountType: "company",
            otp: req.body.otp
        });
    }
};

exports.handleCompanyLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "Email and password are required" 
            });
        }
        
        const company = await Company.findOne({ email });
        if (!company) {
            return res.status(404).json({ 
                success: false,
                message: "Company not found with this email" 
            });
        }
        
        // Verify password
        const isPasswordValid = await comparePassword(password, company.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid password" 
            });
        }

        // Generate JWT token
        const token = generateToken(company);
        
        // Set token in HTTP-only cookie
        res.cookie('auth_token', token, cookieOptions);
        
        res.status(200).json({
            success: true,
            message: "Login successful",
            company: {
                id: company._id,
                email: company.email,
                username: company.username,
                role: company.role
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error during login", 
            error: error.message 
        });
    }
};

exports.handleCompanyLogout = async (req, res) => {
    try {
        // Clear the auth cookie
        res.clearCookie('auth_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error during logout", 
            error: error.message 
        });
    }
};

exports.getCompanyProfile = async (req, res) => {
    try {
        const company = await Company.findById(req.company.id).select('-password');
        
        if (!company) {
            return res.status(404).json({ 
                success: false,
                message: "Company not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            company
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: "Error fetching company profile", 
            error: error.message 
        });
    }
};

exports.updateCompanyProfile = async (req, res) => {
    try {
        const { username, role } = req.body;
        
        // Validate required fields
        if (!username || !role) {
            return res.status(400).json({ 
                success: false,
                message: "Username and role are required" 
            });
        }
        
        // Check if username is already taken by another company
        const existingCompany = await Company.findOne({ 
            username, 
            _id: { $ne: req.company.id } 
        });
        
        if (existingCompany) {
            return res.status(400).json({ 
                success: false,
                message: "Username is already taken" 
            });
        }
        
        // Update company profile
        const updatedCompany = await Company.findByIdAndUpdate(
            req.company.id,
            { username, role },
            { new: true, select: '-password' }
        );
        
        res.status(200).json({
            success: true,
            message: "Company profile updated successfully",
            company: {
                id: updatedCompany._id,
                email: updatedCompany.email,
                username: updatedCompany.username,
                role: updatedCompany.role
            }
        });
    } catch (error) {
        console.error("Update company profile error:", error);
        res.status(500).json({ 
            success: false,
            message: "Error updating company profile", 
            error: error.message 
        });
    }
};

// Upload Company Profile Picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        const companyId = req.company.id; // Extracted from middleware
        const imageUrl = req.file.secure_url;

        const updatedCompany = await Company.findByIdAndUpdate(
            companyId,
            { profilePicture: imageUrl },
            { new: true, select: '-password' }
        );
        
        res.status(200).json({
            success: true,
            message: "Profile picture updated successfully",
            company: {
                id: updatedCompany._id,
                email: updatedCompany.email,
                username: updatedCompany.username,
                role: updatedCompany.role,
                profilePicture: updatedCompany.profilePicture
            }
        });
    } catch (error) {
        console.error("Upload profile picture error:", error);
        res.status(500).json({ 
            success: false,
            message: "Error uploading profile picture", 
            error: error.message 
        });
    }
};

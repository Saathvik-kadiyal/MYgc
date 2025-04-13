const User = require("../models/user.model.js");
const Post = require("../models/post.model.js");
const cloudinary = require("../config/cloudinary.js");
const Category = require('../models/category.model');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('category', 'type experience')
      .populate('connections', 'username profilePicture')
      .populate({
        path: 'posts',
        select: 'media mediaType caption upvotes downvotes createdAt',
        options: { sort: { createdAt: -1 } }
      });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { username, phoneNumber, location, socialMediaLinks, interestedCategories } = req.body;
    
    // Validate username if provided
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.user.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: "Username is already taken" 
        });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        username,
        phoneNumber,
        location,
        socialMediaLinks,
        interestedCategories
      },
      { new: true }
    )
    .select('-password')
    .populate('category', 'type experience');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No image file uploaded" 
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ugc_profile_pictures',
      resource_type: 'auto'
    });

    // Update user profile picture
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: result.secure_url },
      { new: true }
    )
    .select('-password');

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { type, experience, proof } = req.body;
    
    // Find user and their category
    const user = await User.findById(req.user.id)
      .populate('category', 'type experience proof');
      
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      user.category._id,
      {
        type,
        experience,
        proof
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Delete user's category
    await Category.findByIdAndDelete(user.category);

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully"
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Upload Post Media
exports.uploadPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caption } = req.body;

    console.log("Upload request received:", {
      userId,
      caption,
      file: req.file ? {
        filename: req.file.filename,
        path: req.file.path,
        mimetype: req.file.mimetype,
        size: req.file.size,
        originalname: req.file.originalname,
        fieldname: req.file.fieldname
      } : null,
      body: req.body
    });

    // Check if file exists
    if (!req.file) {
      console.error("No file uploaded");
      return res.status(400).json({ message: "No media file uploaded" });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.error("Invalid file type:", req.file.mimetype);
      return res.status(400).json({ message: "Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, WebM) are allowed" });
    }

    // Upload to Cloudinary directly
    console.log("Uploading to Cloudinary:", req.file.path);
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ugc_posts',
      resource_type: 'auto'
    });

    console.log("Cloudinary upload result:", result);

    if (!result.secure_url) {
      console.error("No secure_url in Cloudinary response:", result);
      return res.status(500).json({ message: "Error uploading file to Cloudinary" });
    }

    const mediaUrl = result.secure_url;
    const mediaType = req.file.mimetype.startsWith('image') ? 'image' : 'video';

    // Create new post
    const newPost = new Post({
      media: mediaUrl,
      mediaType,
      caption,
      owner: userId
    });

    console.log("Creating new post:", newPost);

    await newPost.save();

    // Add post reference to user
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }
    user.posts.push(newPost._id);
    await user.save();

    // Get the populated post
    const populatedPost = await Post.findById(newPost._id)
      .select("media mediaType caption upvotes downvotes createdAt");

    console.log("Post created successfully:", populatedPost);

    res.status(201).json({ 
      message: "Post uploaded successfully", 
      post: populatedPost
    });
  } catch (error) {
    console.error("Error in uploadPost:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware

    // Delete all posts owned by the user
    await Post.deleteMany({ owner: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account and posts deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

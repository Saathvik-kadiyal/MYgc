const User = require("../models/user.model.js");
const Post = require("../models/post.model.js");
const cloudinary = require("../config/cloudinary.js");

exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user ? req.user.id : null;

    const user = await User.findOne({ username })
      .select("-password -email") // Exclude password and email for security
      .populate("category", "type experience") // Get full category details
      .populate("connections", "username profilePicture") // Get connections
      .populate({
        path: "posts",
        select: "media mediaType caption upvotes downvotes upvotedBy downvotedBy createdAt owner",
        options: { sort: { createdAt: -1 } }
      })
      .populate({
        path: "posts.owner",
        select: "username profilePicture"
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
        
        // Add isUpvoted and isDownvoted flags if user is authenticated
        if (currentUserId) {
          post.isUpvoted = post.upvotedBy.includes(currentUserId);
          post.isDownvoted = post.downvotedBy.includes(currentUserId);
        }
        
        return post;
      });
    }

    // Add isCurrentUser flag if user is authenticated
    if (currentUserId) {
      user.isCurrentUser = user._id.toString() === currentUserId;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.editUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // Extracted from auth middleware
    const updates = req.body;

    // Check if the logged-in user is updating their own profile
    if (id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Allowed fields to update
    const allowedFields = ["username", "phoneNumber", "profilePicture", "socialMediaLinks", "description", "category"];
    const updateData = {};

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true })
      .select("-password -email")
      .populate({
        path: "posts",
        select: "media mediaType caption upvotes downvotes createdAt",
        options: { sort: { createdAt: -1 } }
      });

    res.status(200).json(updatedUser);
  } catch (error) {

    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Upload Profile Picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from middleware
    
    console.log('Profile picture upload request:', {
      userId,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path,
        filename: req.file.filename,
        secure_url: req.file.secure_url
      } : 'No file',
      body: req.body
    });
    
    // Check if file exists
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ message: "No image file uploaded" });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      console.error('Invalid file type:', req.file.mimetype);
      return res.status(400).json({ message: "Invalid file type. Only images (JPEG, PNG, GIF) are allowed" });
    }
    
    // Extract the secure_url from the Cloudinary response
    // The secure_url might be in different locations depending on the Cloudinary response
    let imageUrl = req.file.secure_url;
    
    // If secure_url is not directly available, try to construct it from the path
    if (!imageUrl && req.file.path) {
      // The path from Cloudinary is typically in the format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename.jpg
      imageUrl = req.file.path;
      console.log('Using path as image URL:', imageUrl);
    }
    
    // If we still don't have a URL, try to get it from the Cloudinary response
    if (!imageUrl && req.file.filename) {
      // Construct the URL from the cloudinary config and filename
      const cloudinaryConfig = require('../config/cloudinary');
      const cloudName = cloudinaryConfig.config().cloud_name;
      imageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${req.file.filename}`;
      console.log('Constructed image URL from filename:', imageUrl);
    }
    
    if (!imageUrl) {
      console.error('Could not determine image URL from Cloudinary response');
      return res.status(500).json({ message: "Failed to get image URL from Cloudinary" });
    }
    
    console.log('Image URL from Cloudinary:', imageUrl);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    ).select("-password -email");
    
    console.log('Updated user profile:', {
      id: updatedUser._id,
      username: updatedUser.username,
      profilePicture: updatedUser.profilePicture
    });

    res.status(200).json({ message: "Profile picture updated", user: updatedUser });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: "Server Error", error: error.message });
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

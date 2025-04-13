const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary.js");
const path = require('path');

// Log Cloudinary configuration
console.log("Cloudinary Storage Configuration:", {
  folder: "user_uploads",
  allowed_formats: ["jpg", "png", "jpeg", "mp4", "webm"],
  resource_type: "auto"
});

// Create Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_uploads",
    resource_type: "auto", // Automatically detect resource type
  },
});

// Configure multer for memory storage (primary)
const memoryStorage = multer.memoryStorage();

// Configure multer for temporary storage (fallback)
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/tmp/'); // Store files in /tmp directory
    },
    filename: function (req, file, cb) {
        const filename = Date.now() + '-' + file.originalname;
        cb(null, filename);
    }
});

const upload = multer({
    storage: memoryStorage, // Use memory storage as primary
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    }
});

// Fallback upload for when memory storage fails
const fallbackUpload = multer({
    storage: diskStorage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed.'));
        }
    }
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: "File size too large. Maximum size is 5MB."
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    } else if (err) {
        // If there's an error with memory storage, try fallback
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return fallbackUpload.single('file')(req, res, next);
        }
        return res.status(500).json({
            success: false,
            message: "Error uploading file"
        });
    }
    next();
};

module.exports = {
  upload,
  fallbackUpload,
  handleUploadError
};

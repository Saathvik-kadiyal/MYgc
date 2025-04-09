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

// Configure multer for temporary storage (fallback)
const tempStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Setting destination for file:", file.originalname);
    cb(null, '/tmp/'); // Store files in /tmp directory
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    console.log("Setting filename:", filename);
    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  console.log("Processing file:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm'];
  if (allowedTypes.includes(file.mimetype)) {
    console.log("File type accepted:", file.mimetype);
    cb(null, true);
  } else {
    console.error("File type rejected:", file.mimetype);
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, WebM) are allowed.'), false);
  }
};

// Create multer upload instance with Cloudinary storage
const upload = multer({
  storage: cloudinaryStorage, // Use Cloudinary storage instead of tempStorage
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// Error handling middleware
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ message: err.message });
  } else if (err) {
    console.error("Upload error:", err);
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = {
  upload,
  handleUploadError
};

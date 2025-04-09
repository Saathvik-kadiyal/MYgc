const cloudinary = require("cloudinary").v2;
require("dotenv").config();

// Log Cloudinary configuration (without sensitive data)
console.log("Cloudinary Configuration:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "***" : "Not set",
  api_secret: process.env.CLOUDINARY_API_SECRET? "***" : "Not set"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;

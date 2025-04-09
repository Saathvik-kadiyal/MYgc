const User = require("../models/user.model.js");
const Category = require("../models/category.model.js");

// Search freshers
exports.searchFreshers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    // Find fresher users based on category type
    const fresherUsers = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } }
      ]
    })
    .select("-password -email")
    .populate({
      path: "category",
      match: { type: "fresher" }
    })
    .limit(20);
    
    // Filter out users without a fresher category
    const filteredUsers = fresherUsers.filter(user => user.category && user.category.type === "fresher");
    
    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    console.error("Error in searchFreshers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Search brands
exports.searchBrands = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    // Assuming brands are users with a specific category or attribute
    // You may need to adjust this based on your actual data model
    const brands = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } }
      ],
      // Add any specific criteria for brands
      // For example: { isBrand: true } or { category: brandCategoryId }
    })
    .select("-password -email")
    .populate("category", "type experience")
    .limit(20);
    
    res.status(200).json({ brands });
  } catch (error) {
    console.error("Error in searchBrands:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Search experienced users
exports.searchExperiencedUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    // Find experienced users based on category type
    const experiencedUsers = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { phoneNumber: { $regex: query, $options: 'i' } }
      ]
    })
    .select("-password -email")
    .populate({
      path: "category",
      match: { type: "experienced" }
    })
    .limit(20);
    
    // Filter out users without an experienced category
    const filteredUsers = experiencedUsers.filter(user => user.category && user.category.type === "experienced");
    
    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    console.error("Error in searchExperiencedUsers:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
}; 
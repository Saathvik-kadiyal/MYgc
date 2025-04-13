const Post = require("../models/post.model.js");
const User = require("../models/user.model.js");
const Company = require("../models/company.model.js");

//Getting all posts for the feed
exports.getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get posts with pagination
    const posts = await Post.find()
      .populate("owner", "username profilePicture role companyName companyLogo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination info
    const total = await Post.countDocuments();

    // Calculate if there are more posts to load
    const hasMore = skip + posts.length < total;

    // Add isUpvoted and isDownvoted flags if user/company is authenticated
    if (req.user) {
      posts.forEach(post => {
        post.isUpvoted = post.upvotedBy?.includes(req.user.id) || false;
        post.isDownvoted = post.downvotedBy?.includes(req.user.id) || false;
      });
    }

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      hasMore,
      totalPosts: total
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({ message: "Error fetching feed", error: error.message });
  }
};

//Voting on a post
exports.votePost = async (req, res) => {
  const { postId } = req.params;
  const { type } = req.body;
  const userId = req.user.id;
  const userModel = req.user.role === 'company' ? 'Company' : 'User';

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasUpvoted = post.upvotedBy.includes(userId);
    const hasDownvoted = post.downvotedBy.includes(userId);

    // Cancel vote if already voted the same
    if ((type === "upvote" && hasUpvoted) || (type === "downvote" && hasDownvoted)) {
      if (type === "upvote") {
        post.upvotes -= 1;
        post.upvotedBy.pull(userId);
      } else {
        post.downvotes -= 1;
        post.downvotedBy.pull(userId);
      }
    } else {
      // Remove the opposite vote if exists
      if (type === "upvote") {
        if (hasDownvoted) {
          post.downvotes -= 1;
          post.downvotedBy.pull(userId);
        }
        post.upvotes += 1;
        post.upvotedBy.push(userId);
        post.upvoterModel = userModel;
      } else if (type === "downvote") {
        if (hasUpvoted) {
          post.upvotes -= 1;
          post.upvotedBy.pull(userId);
        }
        post.downvotes += 1;
        post.downvotedBy.push(userId);
        post.downvoterModel = userModel;
      } else {
        return res.status(400).json({ message: "Invalid vote type" });
      }
    }

    await post.save();

    res.status(200).json({
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      userVote: type
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// DELETE a specific post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id; // From auth middleware

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check ownership
    if (post.owner.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// Upload Post Media
exports.uploadPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { caption, mediaType } = req.body;
    const userModel = req.user.role === 'company' ? 'Company' : 'User';

    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "No media file uploaded" });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ message: "Invalid file type. Only images (JPEG, PNG, GIF) and videos (MP4, MOV) are allowed" });
    }

    const mediaUrl = req.file.secure_url;
    // Use the mediaType from the request, or determine it from the file if not provided
    const postMediaType = mediaType || (req.file.mimetype.startsWith('image') ? 'image' : 'video');

    // Create new post
    const newPost = new Post({
      media: mediaUrl,
      mediaType: postMediaType,
      caption,
      owner: userId,
      ownerModel: userModel
    });

    await newPost.save();

    // Add post reference to user or company based on role
    if (userModel === 'Company') {
      const company = await Company.findById(userId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      company.posts.push(newPost._id);
      await company.save();
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.posts.push(newPost._id);
      await user.save();
    }

    // Get the populated post
    const populatedPost = await Post.findById(newPost._id)
      .populate("owner", "username profilePicture role companyName companyLogo")
      .select("media mediaType caption upvotes downvotes createdAt");

    res.status(201).json({ 
      message: "Post uploaded successfully", 
      post: populatedPost
    });
  } catch (error) {
    console.error("Error in uploadPost:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const mongoose = require('mongoose');
const Category = require('./category.model.js');
const Job = require('./job.model.js');
const Connection = require('./connection.model.js');
const Notification = require('./notification.model.js');
const Post = require('./post.model.js');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  interestedCategories: [{ type: String, enum: ['Photographer', 'Video'] }],
  socialMediaLinks: [{ platform: String, link: String }],
  profilePicture: { type: String },
  location: {
    city: { type: String },
    country: { type: String }
  },
  connectionsCount: { type: Number, default: 0 },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Connection' }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

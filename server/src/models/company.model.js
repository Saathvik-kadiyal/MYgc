const mongoose = require("mongoose");
const Job = require("./job.model.js");
const Connection = require("./connection.model.js");
const Notification = require("./notification.model.js");

const companySchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Required for manual authentication
  role: { type: String, required: true },
  profilePicture: { type: String }, // URL to profile picture
  jobPostings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Job" }],
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Connection" }],
  notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }] // ✅ Same as User schema
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);

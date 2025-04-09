const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  media: { type: String, required: true },
  mediaType: { type: String, enum: ['image', 'video'], required: true },
  caption: { type: String },
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

postSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  type: { type: String, enum: ['experienced', 'fresher'], required: true },
  experience: { type: Number, min: 0 },
  proof: [{ type: String }] // URLs to screenshots of reviews (only for experienced users)
});

module.exports = mongoose.model('Category', categorySchema);

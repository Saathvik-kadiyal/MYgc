const mongoose = require('mongoose');

const companyCategorySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['small', 'mid', 'large'], 
    required: true 
  },
  description: { type: String }
});

module.exports = mongoose.model('CompanyCategory', companyCategorySchema); 
const mongoose = require('mongoose');
const User = require('./user.model.js');
const Company = require('./company.model.js');

const jobSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: { type: [String], required: true },
  budget: { type: Number, required: true, min: 10 },
  applications: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
  }]
}, { 
  timestamps: true,
  indexes: [
    { company: 1 },
    { requiredSkills: 1 },
    { title: 'text', description: 'text' },
    { 'applications.user': 1 },
    { 'applications.status': 1 }
  ]
});

module.exports = mongoose.model('Job', jobSchema);

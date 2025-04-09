const mongoose = require('mongoose');

const connectionSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, refPath: 'requesterModel', required: true },
  requesterModel: { type: String, enum: ['User', 'Company'], required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverModel', required: true },
  receiverModel: { type: String, enum: ['User', 'Company'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Connection', connectionSchema);

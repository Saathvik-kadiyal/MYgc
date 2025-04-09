const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['connection_request', 'job_application', 'message', 'job_offer', 'other'], 
    required: true 
  },
  message: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'senderModel' },
  senderModel: { type: String, enum: ['User', 'Company'], required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'receiverModel', index: true },
  receiverModel: { type: String, enum: ['User', 'Company'], required: true },
  isRead: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'expired'],
    default: 'pending'
  },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // ID of related entity (job, connection, etc.)
  expiresAt: { type: Date, default: () => new Date(+new Date() + 30*24*60*60*1000) } // 30 days from now
}, { 
  timestamps: true,
  indexes: [
    { receiver: 1, createdAt: -1 },
    { expiresAt: 1, expireAfterSeconds: 0 } // TTL index for automatic deletion
  ]
});

module.exports = mongoose.model('Notification', notificationSchema);

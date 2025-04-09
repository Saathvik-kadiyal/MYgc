const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel', required: true, index: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverModel', required: true, index: true },
  senderModel: { type: String, enum: ['User', 'Company'], required: true },
  receiverModel: { type: String, enum: ['User', 'Company'], required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }], // Array of file URLs (optional)
  isRead: { type: Boolean, default: false },
  conversationId: { type: String, required: true, index: true } // Used to group messages in a chat
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);

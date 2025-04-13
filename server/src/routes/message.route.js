const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
    checkMessageOwnership,
    checkConversationAccess,
    validateMessageContent
} = require('../middleware/message.middleware');
const {
    getConversations,
    getMessages,
    sendMessage,
    markMessageAsRead,
    deleteMessage
} = require('../controllers/message.controller');

// All routes are protected by authentication
router.use(protect);

// Get all conversations
router.get('/conversations', getConversations);

// Get messages for a specific conversation
router.get('/:conversationId', checkConversationAccess, getMessages);

// Send a message
router.post('/:conversationId', checkConversationAccess, validateMessageContent, sendMessage);

// Mark message as read
router.put('/:messageId/read', checkMessageOwnership, markMessageAsRead);

// Delete a message
router.delete('/:messageId', checkMessageOwnership, deleteMessage);

module.exports = router; 
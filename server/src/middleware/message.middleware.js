const Message = require('../models/message.model');
const { checkConnection } = require('./connection.middleware');

exports.checkMessageOwnership = async (req, res, next) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check if the user is either the sender or receiver of the message
        if (message.sender.toString() !== req.user._id.toString() && 
            message.receiver.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to access this message' });
        }

        req.message = message;
        next();
    } catch (error) {
        next(error);
    }
};

exports.checkConversationAccess = async (req, res, next) => {
    try {
        const { conversationId } = req.params;
        const { otherUserId } = req.query;

        // Check if users are connected
        const isConnected = await checkConnection(req.user._id, otherUserId);
        if (!isConnected) {
            return res.status(403).json({ message: 'You can only message connected users' });
        }

        // Check if the conversation exists and belongs to the user
        const conversation = await Message.findOne({
            conversationId,
            $or: [
                { sender: req.user._id },
                { receiver: req.user._id }
            ]
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        next();
    } catch (error) {
        next(error);
    }
};

exports.validateMessageContent = (req, res, next) => {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    if (content.length > 1000) {
        return res.status(400).json({ message: 'Message content cannot exceed 1000 characters' });
    }

    next();
}; 
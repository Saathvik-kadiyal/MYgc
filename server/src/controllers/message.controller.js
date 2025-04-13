const Message = require('../models/message.model');
const { checkConnection } = require('../middleware/connection.middleware');
const asyncHandler = require('express-async-handler');

// Get all conversations for the current user
exports.getConversations = asyncHandler(async (req, res) => {
    const conversations = await Message.aggregate([
        {
            $match: {
                $or: [
                    { sender: req.user._id },
                    { receiver: req.user._id }
                ]
            }
        },
        {
            $group: {
                _id: '$conversationId',
                lastMessage: { $last: '$$ROOT' },
                unreadCount: {
                    $sum: {
                        $cond: [
                            { $and: [
                                { $eq: ['$receiver', req.user._id] },
                                { $eq: ['$isRead', false] }
                            ]},
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $sort: { 'lastMessage.createdAt': -1 }
        }
    ]);

    res.json({ conversations });
});

// Get messages for a specific conversation
exports.getMessages = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    
    // Check if users are connected
    const isConnected = await checkConnection(req.user._id, req.query.otherUserId);
    if (!isConnected) {
        return res.status(403).json({ message: 'You can only message connected users' });
    }

    const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 });

    res.json({ messages });
});

// Send a message
exports.sendMessage = asyncHandler(async (req, res) => {
    const { conversationId } = req.params;
    const { content, receiverId } = req.body;

    // Check if users are connected
    const isConnected = await checkConnection(req.user._id, receiverId);
    if (!isConnected) {
        return res.status(403).json({ message: 'You can only message connected users' });
    }

    const message = await Message.create({
        sender: req.user._id,
        receiver: receiverId,
        content,
        conversationId
    });

    res.status(201).json({ message });
});

// Mark message as read
exports.markMessageAsRead = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
        return res.status(404).json({ message: 'Message not found' });
    }

    if (message.receiver.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to mark this message as read' });
    }

    message.isRead = true;
    await message.save();

    res.json({ message });
});

// Delete a message
exports.deleteMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    if (!message) {
        return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    await message.remove();

    res.json({ message: 'Message deleted successfully' });
}); 
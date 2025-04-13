const socketIO = require('socket.io');

class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
        this.userConversations = new Map(); // Track which conversations users are in
    }

    initialize(server) {
        this.io = socketIO(server, {
            cors: {
                origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:3000'],
                credentials: true
            }
        });

        this.io.on('connection', (socket) => {
            console.log('New client connected');

            // Store user's socket ID when they connect
            socket.on('userConnected', (userId) => {
                this.connectedUsers.set(userId, socket.id);
                console.log(`User ${userId} connected with socket ID ${socket.id}`);
            });

            // Handle joining a conversation
            socket.on('joinConversation', (conversationId) => {
                socket.join(conversationId);
                if (!this.userConversations.has(socket.id)) {
                    this.userConversations.set(socket.id, new Set());
                }
                this.userConversations.get(socket.id).add(conversationId);
                console.log(`User joined conversation ${conversationId}`);
            });

            // Handle leaving a conversation
            socket.on('leaveConversation', (conversationId) => {
                socket.leave(conversationId);
                if (this.userConversations.has(socket.id)) {
                    this.userConversations.get(socket.id).delete(conversationId);
                }
                console.log(`User left conversation ${conversationId}`);
            });

            // Handle sending a message
            socket.on('sendMessage', (message) => {
                // Broadcast the message to all users in the conversation
                this.io.to(message.conversationId).emit('newMessage', message);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                // Remove user from connected users
                for (const [userId, socketId] of this.connectedUsers.entries()) {
                    if (socketId === socket.id) {
                        this.connectedUsers.delete(userId);
                        console.log(`User ${userId} disconnected`);
                        break;
                    }
                }
                // Clean up conversation tracking
                this.userConversations.delete(socket.id);
            });
        });
    }

    // Emit connection request notification
    emitConnectionRequest(receiverId, data) {
        const socketId = this.connectedUsers.get(receiverId);
        if (socketId) {
            this.io.to(socketId).emit('connectionRequest', data);
        }
    }

    // Emit connection status update
    emitConnectionStatus(userId, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit('connectionStatus', data);
        }
    }

    // Emit job application notification
    emitJobApplication(companyId, data) {
        const socketId = this.connectedUsers.get(companyId);
        if (socketId) {
            this.io.to(socketId).emit('jobApplication', data);
        }
    }

    // Emit application status update
    emitApplicationStatus(userId, data) {
        const socketId = this.connectedUsers.get(userId);
        if (socketId) {
            this.io.to(socketId).emit('applicationStatus', data);
        }
    }

    // Emit vote update
    emitVoteUpdate(postId, data) {
        this.io.emit('voteUpdate', { postId, ...data });
    }

    // Emit message to specific conversation
    emitMessage(conversationId, message) {
        this.io.to(conversationId).emit('newMessage', message);
    }
}

module.exports = new SocketService(); 
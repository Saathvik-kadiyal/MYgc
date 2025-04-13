const User = require("../models/user.model.js");
const Company = require("../models/company.model.js");
const Connection = require("../models/connection.model.js");
const Notification = require('../models/notification.model.js');
const { sendEmail } = require('../utils/email');
const socketService = require('../services/socket.service.js');

/**
 * Send a connection request
 */
exports.connectWithUser = async (req, res) => {
    try {
        const { targetId, message } = req.body;
        const senderId = req.user._id;

        // Check if connection already exists
        const existingConnection = await Connection.findOne({
            $or: [
                { sender: senderId, receiver: targetId },
                { sender: targetId, receiver: senderId }
            ]
        });

        if (existingConnection) {
            return res.status(400).json({
                success: false,
                message: 'Connection already exists'
            });
        }

        // Create new connection request
        const connection = await Connection.create({
            sender: senderId,
            receiver: targetId,
            message,
            status: 'pending'
        });

        // Create notification for the receiver
        const notification = await Notification.create({
            type: 'connection_request',
            sender: senderId,
            receiver: targetId,
            message: `${req.user.username} sent you a connection request`,
            status: 'pending'
        });

        // Emit real-time notification
        socketService.emitConnectionRequest(targetId, {
            connection,
            notification
        });

        res.status(201).json({
            success: true,
            connection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Accept a connection request
 */
exports.acceptConnection = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const userId = req.user._id;

        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Connection not found'
            });
        }

        if (connection.receiver.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to accept this connection'
            });
        }

        connection.status = 'accepted';
        await connection.save();

        // Create notification for the sender
        const notification = await Notification.create({
            type: 'connection_accepted',
            sender: userId,
            receiver: connection.sender,
            message: `${req.user.username} accepted your connection request`,
            status: 'completed'
        });

        // Emit real-time notification
        socketService.emitConnectionStatus(connection.sender, {
            connection,
            notification
        });

        res.json({
            success: true,
            connection
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Reject a connection request
 */
exports.rejectConnection = async (req, res) => {
    try {
        const { connectionId } = req.params;
        const userId = req.user._id;

        const connection = await Connection.findById(connectionId);
        if (!connection) {
            return res.status(404).json({
                success: false,
                message: 'Connection not found'
            });
        }

        if (connection.receiver.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to reject this connection'
            });
        }

        connection.status = 'rejected';
        await connection.save();

        // Create notification for the sender
        const notification = await Notification.create({
            type: 'connection_rejected',
            sender: userId,
            receiver: connection.sender,
            message: `${req.user.username} rejected your connection request`,
            status: 'completed'
        });

        // Emit real-time notification
        socketService.emitConnectionStatus(connection.sender, {
            connection,
            notification
        });

        res.json({
            success: true,
            message: 'Connection rejected'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all connections for the current user/company
 */
exports.getConnections = async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Try to find in Company first
      let entity = await Company.findById(userId).populate({
        path: "connections",
        populate: [
          { path: "requester", refPath: "requesterModel" },
          { path: "receiver", refPath: "receiverModel" }
        ]
      });
  
      // If not found, then it must be a User
      if (!entity) {
        entity = await User.findById(userId).populate({
          path: "connections",
          populate: [
            { path: "requester", refPath: "requesterModel" },
            { path: "receiver", refPath: "receiverModel" }
          ]
        });
      }
  
      if (!entity) {
        return res.status(404).json({ message: "Entity not found." });
      }
  
      return res.status(200).json({ connections: entity.connections });
  
    } catch (error) {
      console.error("getConnections error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  

/**
 * Send connection request
 */
exports.sendConnectionRequest = async (req, res) => {
    try {
        const { username } = req.params;
        const sender = req.user;

        // Check if the target is a user or company
        let target = await User.findOne({ username });
        let isCompany = false;

        if (!target) {
            target = await Company.findOne({ username });
            isCompany = true;
        }

        if (!target) {
            return res.status(404).json({ message: 'User or company not found' });
        }

        // Check if already connected
        if (target.connections.includes(sender._id)) {
            return res.status(400).json({ message: 'Already connected' });
        }

        // Check if request already sent
        if (target.connectionRequests.includes(sender._id)) {
            return res.status(400).json({ message: 'Connection request already sent' });
        }

        // Add to connection requests
        target.connectionRequests.push(sender._id);
        await target.save();

        // Send email notification
        const emailSubject = 'New Connection Request';
        const emailText = `${sender.username} has sent you a connection request.`;
        await sendEmail(target.email, emailSubject, emailText);

        res.status(200).json({ message: 'Connection request sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Accept connection request
 */
exports.acceptConnectionRequest = async (req, res) => {
    try {
        const { username } = req.params;
        const receiver = req.user;

        // Check if the sender is a user or company
        let sender = await User.findOne({ username });
        let isCompany = false;

        if (!sender) {
            sender = await Company.findOne({ username });
            isCompany = true;
        }

        if (!sender) {
            return res.status(404).json({ message: 'User or company not found' });
        }

        // Check if request exists
        if (!receiver.connectionRequests.includes(sender._id)) {
            return res.status(400).json({ message: 'No connection request found' });
        }

        // Remove from connection requests
        receiver.connectionRequests = receiver.connectionRequests.filter(
            id => id.toString() !== sender._id.toString()
        );

        // Add to connections
        receiver.connections.push(sender._id);
        sender.connections.push(receiver._id);

        await receiver.save();
        await sender.save();

        // Send email notification
        const emailSubject = 'Connection Request Accepted';
        const emailText = `${receiver.username} has accepted your connection request.`;
        await sendEmail(sender.email, emailSubject, emailText);

        res.status(200).json({ message: 'Connection request accepted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Reject connection request
 */
exports.rejectConnectionRequest = async (req, res) => {
    try {
        const { username } = req.params;
        const receiver = req.user;

        // Check if the sender is a user or company
        let sender = await User.findOne({ username });
        let isCompany = false;

        if (!sender) {
            sender = await Company.findOne({ username });
            isCompany = true;
        }

        if (!sender) {
            return res.status(404).json({ message: 'User or company not found' });
        }

        // Check if request exists
        if (!receiver.connectionRequests.includes(sender._id)) {
            return res.status(400).json({ message: 'No connection request found' });
        }

        // Remove from connection requests
        receiver.connectionRequests = receiver.connectionRequests.filter(
            id => id.toString() !== sender._id.toString()
        );

        await receiver.save();

        res.status(200).json({ message: 'Connection request rejected successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get connection requests
 */
exports.getConnectionRequests = async (req, res) => {
    try {
        const user = req.user;
        const requests = await Promise.all(
            user.connectionRequests.map(async (id) => {
                let request = await User.findById(id);
                if (!request) {
                    request = await Company.findById(id);
                }
                return request;
            })
        );

        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Remove connection
 */
exports.removeConnection = async (req, res) => {
    try {
        const { username } = req.params;
        const user = req.user;

        // Check if the target is a user or company
        let target = await User.findOne({ username });
        let isCompany = false;

        if (!target) {
            target = await Company.findOne({ username });
            isCompany = true;
        }

        if (!target) {
            return res.status(404).json({ message: 'User or company not found' });
        }

        // Remove from connections
        user.connections = user.connections.filter(
            id => id.toString() !== target._id.toString()
        );
        target.connections = target.connections.filter(
            id => id.toString() !== user._id.toString()
        );

        await user.save();
        await target.save();

        res.status(200).json({ message: 'Connection removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
  

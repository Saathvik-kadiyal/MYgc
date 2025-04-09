const User = require("../models/user.model.js");
const Company = require("../models/company.model.js");
const Connection = require("../models/connection.model.js");

/**
 * Send a connection request
 */
exports.connectWithUser = async (req, res) => {
    try {
      const senderId = req.user.id;
      const { receiverId } = req.body;
  
      // 1. Prevent self-connection
      if (senderId === receiverId) {
        return res.status(400).json({ message: "You cannot connect with yourself." });
      }
  
      // 2. Try finding sender and receiver in both Company and User collections
      let sender = await Company.findById(senderId);
      let receiver = await Company.findById(receiverId);
  
      const senderIsCompany = !!sender?.role;
      const receiverIsCompany = !!receiver?.role;
  
      if (!sender) sender = await User.findById(senderId);
      if (!receiver) receiver = await User.findById(receiverId);
  
      // 3. If either not found
      if (!sender || !receiver) {
        return res.status(404).json({ message: "Sender or receiver not found." });
      }
  
      // 4. Disallow brand ↔ brand connection
      if (senderIsCompany && receiverIsCompany) {
        return res.status(400).json({ message: "Brands cannot connect with each other." });
      }
  
      // 5. Check if connection already exists in either direction
      const existingConnection = await Connection.findOne({
        $or: [
          { requester: senderId, receiver: receiverId },
          { requester: receiverId, receiver: senderId }
        ]
      });
  
      if (existingConnection) {
        return res.status(400).json({ message: "Connection already exists." });
      }
  
      // 6. Create new connection
      const newConnection = new Connection({
        requester: senderId,
        requesterModel: senderIsCompany ? "Company" : "User",
        receiver: receiverId,
        receiverModel: receiverIsCompany ? "Company" : "User",
        status: "pending"
      });
  
      await newConnection.save();
  
      // 7. Update sender and receiver connection lists
      sender.connections.push(newConnection._id);
      receiver.connections.push(newConnection._id);
  
      if (!senderIsCompany) sender.connectionsCount++;
      if (!receiverIsCompany) receiver.connectionsCount++;
  
      await sender.save();
      await receiver.save();
  
      return res.status(200).json({
        message: "Connection request sent successfully.",
        connection: newConnection
      });
  
    } catch (error) {
      console.error("connectWithUser error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  


/**
 * Accept a connection request
 */
exports.acceptConnection = async (req, res) => {
    try {
      const { connectionId } = req.params;
      const userId = req.user.id;
  
      const connection = await Connection.findById(connectionId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found." });
      }
  
      // Ensure the receiver is the one accepting
      if (connection.receiver.toString() !== userId) {
        return res.status(403).json({ message: "You cannot accept this connection." });
      }
  
      // Optional: You can fetch receiver to confirm existence (User or Company)
      let receiver = await Company.findById(userId);
      if (!receiver) receiver = await User.findById(userId);
  
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found." });
      }
  
      connection.status = "accepted";
      await connection.save();
  
      return res.status(200).json({
        message: "Connection accepted.",
        connection
      });
  
    } catch (error) {
      console.error("acceptConnection error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  


/**
 * Reject a connection request
 */
exports.rejectConnection = async (req, res) => {
    try {
      const { connectionId } = req.params;
      const userId = req.user.id;
  
      const connection = await Connection.findById(connectionId);
      if (!connection) {
        return res.status(404).json({ message: "Connection not found." });
      }
  
      if (connection.receiver.toString() !== userId) {
        return res.status(403).json({ message: "You cannot reject this connection." });
      }
  
      // Optional: Ensure receiver exists
      let receiver = await Company.findById(userId);
      if (!receiver) receiver = await User.findById(userId);
  
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found." });
      }
  
      connection.status = "rejected";
      await connection.save();
  
      return res.status(200).json({
        message: "Connection rejected.",
        connection
      });
  
    } catch (error) {
      console.error("rejectConnection error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
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
  

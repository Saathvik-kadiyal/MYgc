const Notification = require("../models/notification.model");

// Get all notifications for a user or company
exports.getNotifications = async (req, res) => {
  try {
    const { id, role } = req.user;

    const notifications = await Notification.find({
      receiver: id,
      receiverModel: role === "company" ? "Company" : "User",
      status: { $ne: 'expired' }
    })
    .sort({ createdAt: -1 })
    .limit(50); // Limit to 50 most recent notifications

    res.status(200).json({ notifications });
  } catch (err) {
    console.error("getNotifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark a single notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Marked as read", notification });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const { id, role } = req.user;

    await Notification.updateMany(
      {
        receiver: id,
        receiverModel: role === "company" ? "Company" : "User",
        status: { $ne: 'expired' }
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark notification as completed (and it will be automatically deleted after TTL)
exports.markAsCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    const { relatedId } = req.body;

    const notification = await Notification.findOneAndUpdate(
      { 
        _id: id,
        relatedId: relatedId // Ensure the notification is related to the correct entity
      },
      { 
        status: 'completed',
        isRead: true
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as completed", notification });
  } catch (err) {
    console.error("markAsCompleted error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { id: userId, role } = req.user;

    const notification = await Notification.findOneAndDelete({
      _id: id,
      receiver: userId,
      receiverModel: role === "company" ? "Company" : "User"
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("deleteNotification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

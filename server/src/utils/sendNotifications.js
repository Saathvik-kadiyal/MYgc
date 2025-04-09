const Notification = require("../models/notification.model.js");

const sendNotification = async ({
  type,
  message,
  sender,
  senderModel,
  receiver,
  receiverModel,
}) => {
  try {
    const notification = await Notification.create({
      type,
      message,
      sender,
      senderModel,
      receiver,
      receiverModel,
    });

    return notification;
  } catch (error) {
    console.error("Notification Error:", error);
  }
};

module.exports = sendNotification;

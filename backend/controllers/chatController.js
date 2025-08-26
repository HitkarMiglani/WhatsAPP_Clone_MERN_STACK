const conversation = require("../models/conversation");
const response = require("../utils/responseHandler");
const { uploadFileToCloudinary } = require("../config/cloudnaryConfig");
const Message = require("../models/messageModel");

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, messageStatus } = req.body;
    const file = req.file;

    const participants = [senderId, receiverId].sort();

    let conversation = await conversation.findOne({
      participants: participants,
    });
    if (!conversation) {
      conversation = new conversation({ participants: participants });
      await conversation.save();
    }

    let imageOrVideoUrl = null;
    let contentType = null;

    if (file) {
      const uploadResult = await uploadFileToCloudinary(file.path);

      if (!uploadResult || !uploadResult.secure_url) {
        return response(res, 400, "File upload failed");
      }
      imageOrVideoUrl = uploadResult?.secure_url;

      if (file.mimetype.startsWith("image")) contentType = "image";
      else if (file.mimetype.startsWith("video")) contentType = "video";
      else return response(res, 400, "Unsupported file type");
    } else if (content?.trim()) {
      contentType = "text";
    } else {
      return response(res, 400, "Message content or file is required");
    }

    const message = new Message({
      conversationId: conversation?._id,
      sender: senderId,
      receiver: receiverId,
      content,
      contentType,
      imageOrVideoUrl,
      messageStatus,
    });

    await message.save();

    if (message?.content) {
      conversation.lastMessage = message.content;
    }

    conversation.unreadCount += 1;
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture");

    return response(res, 200, "Message sent successfully", populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return response(res, 500, "Internal server error");
  }
};

exports.getConversation = async (req, res) => {
  const userId = req.user.userId;
  try {
    let conversations = await conversation
      .find({ participants: userId })
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender receiver",
          select: "username profilePicture",
        },
      })
      .sort({ updatedAt: -1 });

    return response(
      res,
      201,
      "Conversations fetched successfully",
      conversations
    );
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return response(res, 500, "Internal server error");
  }
};

exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.userId;
  try {
    const { page = 1, limit = 20 } = req.query;

    const conversation = await conversation.findById(conversationId);

    if (!conversation) {
      return response(res, 404, "Conversation not found");
    }

    if (!conversation.participants.includes(userId)) {
      return response(res, 403, "Access denied to this conversation");
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture")
      .sort("createdAt");

    await Message.updateMany(
      {
        conversationId: conversationId,
        receiver: receiverId,
        messageStatus: ["sent", "delivered"],
      },
      { $set: { messageStatus: "read" }}
    );

    conversation.unreadCount = 0;

    await conversation.save();

    return response(res, 200, "Messages fetched successfully", messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return response(res, 500, "Internal server error");
  }
};


exports.markAsRead = async (req, res) => {
    const messageIds = req.body;
    const userId = req.user.userId;

    try{
        let messages = await Message.find({
            _id: { $in: messageIds },  
            receiver: userId,
        })

        await Message.updateMany(
            {
                _id: { $in: messageIds },
                receiver: userId, 
            },
            { $set: { messageStatus: "read" } }
        );
    }
    catch(error){
        console.error("Error marking messages as read:", error);
        return response(res, 500, "Internal server error");
    }
}


exports.deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user.userId;

    try {
        const message = await Message.findById(messageId);

        if (!message) {
            return response(res, 404, "Message not found");
        }

        if (message.sender.toString() !== userId) {
            return response(res, 403, "You can only delete your own messages");
        }

        await Message.deleteOne();

        return response(res, 200, "Message deleted successfully");
    } catch (error) {
        console.error("Error deleting message:", error);
        return response(res, 500, "Internal server error");
    }
};
const express = require("express");
const chatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../config/cloudnaryConfig");

const router = express.Router();

router.post("/send-message",authMiddleware,multerMiddleware, chatController.sendMessage);
router.get("/conversations",authMiddleware, chatController.getConversation);
router.get("/conversations/:conversationsId/messages",authMiddleware, chatController.getMessages);


router.put("/messages/read",authMiddleware, chatController.markAsRead);

router.delete("/messages/:messageId",authMiddleware, chatController.deleteMessage);

module.exports = router;

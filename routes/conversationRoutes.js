const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/conversationController");

router.get("/stats", ctrl.getStats);
router.get("/", ctrl.getConversations);
router.get("/:id", ctrl.getConversation);

module.exports = router;

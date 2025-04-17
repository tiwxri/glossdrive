const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

// POST route for WhatsApp messages
router.post('/', chatbotController.handleIncomingMessage);

module.exports = router;

// routes/webhook.js

const express = require('express');
const { handleIncomingMessage } = require('../services/whatsappServices');  // Import the bot logic
const router = express.Router();

// Webhook route to handle incoming WhatsApp messages
router.post('/webhook', async (req, res) => {
  const message = req.body;  // Assuming the message body is coming in as JSON

  try {
    await handleIncomingMessage(message);
    res.status(200).send('Message received and processed');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;

const express = require('express');
const { handleIncomingMessage } = require('../services/whatsappServices');  // Import the bot logic
const router = express.Router();

// Webhook route to handle incoming WhatsApp messages
router.post('/webhook', async (req, res) => {
  console.log('Incoming message:', req.body);  // Log incoming message
  const message = req.body;

  try {
    await handleIncomingMessage(message);
    res.status(200).send('Message received and processed');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;

const express = require('express');
const { handleMessage, handlePostback } = require('../services/whatsappServices');

const router = express.Router();

// Handle webhook for messages
router.post('/', (req, res) => {
  const data = req.body;

  if (data.object) {
    if (data.entry && data.entry[0].changes && data.entry[0].changes[0].value.messages) {
      const message = data.entry[0].changes[0].value.messages[0];
      const phoneNumber = message.from; // Sender's phone number
      const messageText = message.text.body; // Message text

      handleMessage(phoneNumber, messageText); // Call appropriate function to handle the message
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

// Handle postback (button click, etc.)
router.post('/postback', (req, res) => {
  const data = req.body;

  if (data.object) {
    if (data.entry && data.entry[0].changes && data.entry[0].changes[0].value.contacts) {
      const phoneNumber = data.entry[0].changes[0].value.contacts[0].wa_id;
      const postbackPayload = data.entry[0].changes[0].value.messages[0].interactive.button.reply.payload;

      handlePostback(phoneNumber, postbackPayload); // Handle the postback (button selection)
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;

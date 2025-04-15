const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../services/whatsappServices'); // Importing the function to handle messages
const { getGreetingMessage } = require('../utils/greetings'); // Importing greeting logic

// Define the route to handle incoming messages from the webhook
router.post('/', async (req, res) => {
  const message = req.body;  // Incoming message from the user

  try {
    // Check if the message is coming from a valid user
    if (message && message.from) {
      const userId = message.from; // User's phone number

      // Greet the user
      await handleIncomingMessage(userId, message);
      
      res.status(200).send('Message received and processing.');
    } else {
      res.status(400).send('No message or sender found.');
    }
  } catch (error) {
    console.error('Error handling message:', error);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;

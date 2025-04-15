const express = require('express');
const bodyParser = require('body-parser');
const { handleMessageFlow, handlePostbackFlow } = require('./routes/webhook');

const app = express();

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Route to handle webhook events
app.post('/webhook', (req, res) => {
  const senderId = req.body.senderId; // Assuming senderId is sent in the request body
  const message = req.body.message;   // Assuming message is sent in the request body
  const payload = req.body.payload;   // For postback payload

  // Check if it's a message or a postback
  if (message) {
    handleMessageFlow(senderId, message, (senderId, responseMessage) => {
      // Send response back to the user (this could be API response, send message, etc.)
      res.json({ senderId, responseMessage });
    });
  } else if (payload) {
    handlePostbackFlow(senderId, payload, (senderId, responseMessage) => {
      // Send response back to the user (this could be API response, send message, etc.)
      res.json({ senderId, responseMessage });
    });
  } else {
    res.status(400).send('Invalid request');
  }
});

// Start the server on a specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

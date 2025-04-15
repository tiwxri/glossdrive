const express = require('express');
const router = express.Router();
const { handleMessageFlow, handlePostbackFlow } = require('../utils/flow'); // Import from flow.js

router.post('/', (req, res) => {
  const { senderId, message, payload } = req.body;

  if (message) {
    handleMessageFlow(senderId, message, (senderId, responseMessage) => {
      res.json({ senderId, responseMessage });
    });
  } else if (payload) {
    handlePostbackFlow(senderId, payload, (senderId, responseMessage) => {
      res.json({ senderId, responseMessage });
    });
  } else {
    res.status(400).send('Invalid request');
  }
});

module.exports = router;

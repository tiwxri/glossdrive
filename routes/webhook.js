const express = require('express');
const { sendMessage } = require('../services/messageSender');
const { sendServiceOptions, handleServiceResponse } = require('../services/serviceHandler'); // New service handler
const router = express.Router();

router.post('/', async (req, res) => {
  const body = req.body;
  const from = body.entry[0].changes[0].value.messages[0].from;
  const text = body.entry[0].changes[0].value.messages[0].text.body.toLowerCase();

  if (text.includes('hi') || text.includes('hello')) {
    await sendMessage(from, 'Hello! How can I help you today? Please choose a service:');
    await sendServiceOptions(from);
  } else {
    await handleServiceResponse(from, text); // Handle user responses for specific services
  }

  res.sendStatus(200);
});

module.exports = router;

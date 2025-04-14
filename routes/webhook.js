const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../services/whatsappServices');

const { client } = require('../config/client');

client.on('message', async (message) => {
  handleIncomingMessage(message); // pass it to your logic
});

module.exports = router;

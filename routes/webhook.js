const express = require('express');
const router = express.Router();
const whatsappServices = require('../services/whatsappServices');

// Webhook verification (for Meta)
router.get('/', (req, res) => {
  const verify_token = 'glossdrive_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verify_token) {
    console.log('✅ Webhook verified!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Handle incoming messages
router.post('/', async (req, res) => {
  await whatsappServices.handleIncoming(req.body);
  res.sendStatus(200);
});

module.exports = router;

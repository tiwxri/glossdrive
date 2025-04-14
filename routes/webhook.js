// routes/webhook.js
const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../services/whatsappServices');

// Meta WhatsApp webhook GET (for verification)
router.get('/', (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// POST for incoming messages
router.post('/', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      await handleIncomingMessage(message);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error in webhook POST:', error);
    res.sendStatus(500);
  }
});

module.exports = router;

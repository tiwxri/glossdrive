const express = require('express');
const router = express.Router();
const { handleIncomingMessage } = require('../services/whatsappServices');

router.post('/webhook', async (req, res) => {
  try {
    const message = req.body;
    await handleIncomingMessage(message);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error:', err);
    res.sendStatus(500);
  }
});

module.exports = router;

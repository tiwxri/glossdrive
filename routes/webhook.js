const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.post('/', async (req, res, next) => {
  try {
    await chatbotController.handleIncomingMessage(req, res);
  } catch (err) {
    console.error('❌ Error in webhook handler:', err);
    res.sendStatus(500);
  }
});

module.exports = router;

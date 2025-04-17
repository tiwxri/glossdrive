const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.post('/', async (req, res) => {
  try {
    const body = req.body;

    if (body.object && body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const message = body.entry[0].changes[0].value.messages[0];

      let msg;
      if (message.type === 'interactive') {
        const interactive = message.interactive;
        if (interactive.type === 'button_reply') {
          msg = interactive.button_reply.id;
        } else if (interactive.type === 'list_reply') {
          msg = interactive.list_reply.id;
        }
      } else if (message.type === 'text') {
        msg = message.text.body;
      }

      if (msg) {
        await chatbotController.handleIncomingMessage(message.from, msg);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error in webhook handler:', err);
    res.sendStatus(500);
  }
});

module.exports = router;

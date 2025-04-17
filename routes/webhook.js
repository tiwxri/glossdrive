const chatbotController = require('../controllers/chatbotController');
const { flowSteps } = require('../utils/constants');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('🔔 Incoming webhook:', JSON.stringify(req.body, null, 2));

    const body = req.body;
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (messages && messages.length > 0) {
      const message = messages[0];
      const sender = message.from;

      let msg = '';

      if (message.type === 'interactive') {
        const interactive = message.interactive;
        if (interactive.type === 'button_reply') {
          msg = interactive.button_reply.id;
        } else if (interactive.type === 'list_reply') {
          msg = interactive.list_reply.id;
        }
      } else if (message.type === 'text') {
        msg = message.text.body.trim().toLowerCase();
      }

      const greetings = ['hi', 'hello', 'hey', 'start'];
      if (greetings.includes(msg)) {
        await chatbotController.sendMessage(sender, flowSteps.chooseService);
      } else if (msg) {
        await chatbotController.handleIncomingMessage(sender, msg);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error in webhook handler:', err);
    res.sendStatus(500);
  }
});

module.exports = router;

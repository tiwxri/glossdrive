const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');

router.post('/', async (req, res) => {
  try {
    const body = req.body;

    if (body.object && body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages) {
      const message = body.entry[0].changes[0].value.messages[0];
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

      // Handle greetings like "hi", "hello", "start"
      const greetings = ['hi', 'hello', 'hey', 'start'];
      if (greetings.includes(msg)) {
        // You can start with the first flow step
        const flowSteps = require('../utils/constants').flowSteps;
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

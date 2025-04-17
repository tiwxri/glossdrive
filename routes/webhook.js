const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
//
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;

    if (
      body.object === 'whatsapp_business_account' &&
      body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      console.log("Received message:", message);
      // handle message...
    } else {
      console.log("Webhook triggered with no message (might be a status update).");
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error in webhook:", error);
    res.sendStatus(500);
  }
});
//router.post('/', chatbotController.handleIncomingMessage);

module.exports = router;

const chatbotController = require('../controllers/chatbotController');
const { flowSteps } = require('../utils/constants');
const express = require('express');
const router = express.Router();
const axios = require('axios'); // Required for API call to WhatsApp

function getGreetingByIST() {
  const date = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);
  const hour = istDate.getUTCHours();

  if (hour < 12) return 'Good Morning ☀️';
  else if (hour < 17) return 'Good Afternoon 🌤️';
  else return 'Good Evening 🌙';
}

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

      // 🧠 Check session and greet user if first time
      const session = await getSession(sender);
      if (!session || !session.currentStep) {
        const greeting = getGreetingByIST();
        const welcomeText = `👋 ${greeting}!\n\nWelcome to *GlossDrive* 🚗✨\n\n🔥 *Current Offers:*\n- Flat 20% OFF on your first clean\n- Free window shine with premium plan\n\nTap below to get started 👇`;

        const exploreButtonMessage = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: sender,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: welcomeText,
            },
            action: {
              buttons: [
                {
                  type: 'reply',
                  reply: {
                    id: 'explore_now',
                    title: '🚀 Explore Now',
                  },
                },
              ],
            },
          },
        };

        await axios.post(
          `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
          exploreButtonMessage,
          {
            headers: {
              Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        await updateSession(sender, { currentStep: 'awaiting_explore' });
        return res.sendStatus(200); // stop here after greeting
      }

      // 🎯 Process based on message
      if (msg === 'explore_now') {
        await chatbotController.sendMessage(sender, flowSteps.chooseService);
        await updateSession(sender, { currentStep: 'chooseService' });
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

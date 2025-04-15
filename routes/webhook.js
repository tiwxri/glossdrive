const express = require('express');
const axios = require('axios');
const router = express.Router();

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// GET webhook verification
router.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    return res.sendStatus(403);
  }
});

// POST webhook to receive messages
router.post('/', async (req, res) => {
  const body = req.body;

  if (body.object && body.entry && body.entry[0].changes) {
    const message = body.entry[0].changes[0].value?.messages?.[0];
    const phone_number_id = body.entry[0].changes[0].value?.metadata?.phone_number_id;

    if (message && message.from) {
      const from = message.from;
      const name = message.profile?.name || "there";

      const reply = {
        messaging_product: "whatsapp",
        to: from,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: `Hi ${name}! 👋\nWhat service are you looking for?`
          },
          action: {
            buttons: [
              { type: "reply", reply: { id: "exterior", title: "Exterior Wash" } },
              { type: "reply", reply: { id: "interior", title: "Interior Wash" } },
              { type: "reply", reply: { id: "full", title: "Full Car Cleaning" } }
            ]
          }
        }
      };

      try {
        await axios.post(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, reply, {
          headers: {
            Authorization: `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('❌ Error sending message:', error.response?.data || error.message);
      }
    }
  }

  res.sendStatus(200);
});

module.exports = router;

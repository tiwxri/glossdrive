// services/whatsappServices.js
const axios = require('axios');
const { getGreetingMessage } = require('../utils/greetings');

const WHATSAPP_TOKEN = process.env.META_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.META_PHONE_NUMBER_ID;

async function sendMessage(to, message) {
  try {
    await axios.post(`https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`, {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error('❌ Failed to send message:', err.response?.data || err.message);
  }
}

async function handleIncomingMessage(message) {
  const from = message.from;
  const text = message.text?.body?.toLowerCase() || '';

  // First time message or simple greeting flow
  const greeting = getGreetingMessage();
  const reply = `${greeting} 👋 Welcome to *Gloss Drive*! \n\nWhat service are you looking for?\n\n1. Exterior Wash 🚗\n2. Interior Wash 🧼\n3. Full Car Cleaning 🧽`;

  await sendMessage(from, reply);
}

module.exports = { handleIncomingMessage };

const axios = require('axios');
const { getGreetingMessage } = require('../utils/greetings');
const { getServiceButtons } = require('../utils/buttons');

const token = process.env.WHATSAPP_TOKEN;
const phone_number_id = process.env.PHONE_NUMBER_ID;

exports.handleIncoming = async (body) => {
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (message && message.type === 'text') {
    const from = message.from;

    const greeting = getGreetingMessage();
    const buttons = getServiceButtons();

    try {
      await axios.post(
        `https://graph.facebook.com/v18.0/${phone_number_id}/messages`,
        {
          messaging_product: 'whatsapp',
          to: from,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: `${greeting} 👋\n\nPlease choose a service:` },
            action: { buttons },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('✅ Message sent');
    } catch (error) {
      console.error('❌ Error sending message:', error.response?.data || error.message);
    }
  }
};

const axios = require('axios');

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

async function sendMessage(to, message) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        to: to,
        type: message.type || 'text',
        text: message.body ? { body: message.body } : undefined,
        interactive: message.buttons ? {
          type: 'button',
          body: message.text,
          buttons: message.buttons
        } : undefined,
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );
    console.log('Message sent:', response.data);
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

module.exports = { sendMessage };

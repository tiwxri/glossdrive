// services/messageService.js
const axios = require('axios');

exports.sendMessage = async (phone, message) => {
  const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`;

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json',
  };

  let data;

  if (typeof message === 'string') {
    // Plain text message
    data = {
      messaging_product: 'whatsapp',
      to: phone,
      text: { body: message },
    };
  } else {
    // Interactive message (e.g., buttons)
    data = {
      messaging_product: 'whatsapp',
      to: phone,
      ...message,
    };
  }

  try {
    await axios.post(url, data, { headers });
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
};

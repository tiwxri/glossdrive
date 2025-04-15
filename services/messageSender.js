const axios = require('axios');

// Replace with your actual WhatsApp API credentials
const WHATSAPP_API_URL = 'https://graph.facebook.com/v13.0/YOUR_PHONE_NUMBER_ID/messages';
const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

async function sendReply(userId, message) {
  try {
    const response = await axios.post(
      WHATSAPP_API_URL,
      {
        messaging_product: 'whatsapp',
        to: userId,
        text: { body: message },
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Message sent successfully:', response.data);
  } catch (error) {
    console.error('Error sending message:', error.response ? error.response.data : error.message);
  }
}

module.exports = { sendReply };

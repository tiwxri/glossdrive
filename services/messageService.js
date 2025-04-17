const axios = require('axios');

console.log('📞 WHATSAPP_PHONE_ID:', process.env.WHATSAPP_PHONE_ID);
console.log('🔐 WHATSAPP_TOKEN:', process.env.WHATSAPP_TOKEN ? 'SET' : 'NOT SET');

exports.sendMessage = async (phone, message) => {
  
  await axios.post(`https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    messaging_product: 'whatsapp',
    to: phone,
    text: { body: message }
  }, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
};

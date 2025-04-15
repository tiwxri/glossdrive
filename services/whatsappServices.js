const { sendMessage } = require('./messageSender'); // Ensure sendMessage is exported correctly from messageSender.js

async function handleMessage(phoneNumber, messageText) {
  if (messageText.toLowerCase() === 'hi' || messageText.toLowerCase() === 'hello') {
    await sendMessage(phoneNumber, { type: 'text', body: 'Hi! How can I help you today?' });

    // Send the service options after greeting
    const buttonsMessage = {
      type: 'buttons',
      text: 'Please choose a service:',
      buttons: [
        { title: 'Exterior Wash', payload: 'EXTERIOR_WASH' },
        { title: 'Interior Wash', payload: 'INTERIOR_WASH' },
        { title: 'Full Car Cleaning', payload: 'FULL_CLEANING' }
      ]
    };

    await sendMessage(phoneNumber, buttonsMessage);
  }
}

async function handlePostback(phoneNumber, postbackPayload) {
  switch (postbackPayload) {
    case 'EXTERIOR_WASH':
      await sendMessage(phoneNumber, { type: 'text', body: 'You selected Exterior Wash. Would you like to add Window Shine or Wheel Shine?' });
      break;
    case 'INTERIOR_WASH':
      await sendMessage(phoneNumber, { type: 'text', body: 'You selected Interior Wash. Would you like to add Window Shine or Wheel Shine?' });
      break;
    case 'FULL_CLEANING':
      await sendMessage(phoneNumber, { type: 'text', body: 'You selected Full Car Cleaning. Would you like to add Window Shine or Wheel Shine?' });
      break;
    default:
      await sendMessage(phoneNumber, { type: 'text', body: 'I did not understand that. Please try again.' });
  }
}

module.exports = { handleMessage, handlePostback };

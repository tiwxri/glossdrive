const axios = require('axios');
const { getGreetingMessage } = require('../utils/greetings');
const { getServiceButtons, getServiceOptionsButtons } = require('../utils/buttons');
const { getAdditionalOptions } = require('../utils/serviceOptions');

const token = process.env.WHATSAPP_TOKEN;
const phone_number_id = process.env.PHONE_NUMBER_ID;

let userStates = {};  // Store user states temporarily

exports.handleIncoming = async (body) => {
  const entry = body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (message && message.type === 'text') {
    const from = message.from;
    const userMessage = message.text.body.trim().toLowerCase();

    // Get the current user state
    const currentState = userStates[from] || {};

    // Check for initial greeting and service menu
    if (!currentState.service) {
      const greeting = getGreetingMessage();
      const buttons = getServiceButtons();
      await sendButtonMessage(from, greeting, buttons);
      userStates[from] = { ...currentState, step: 'service' };
    }
    // Check if user selected a service (e.g., "exterior wash")
    else if (currentState.step === 'service') {
      if (userMessage === 'exterior wash') {
        const options = getAdditionalOptions('exterior');
        await sendButtonMessage(from, 'Please select additional options:', options);
        userStates[from] = { ...currentState, service: 'exterior wash', step: 'options' };
      }
      // Handle other services similarly (interior wash, full cleaning, etc.)
    }
    // Handle options (e.g., window shine, wheel shine, etc.)
    else if (currentState.step === 'options') {
      const options = getAdditionalOptions(currentState.service);
      if (options.includes(userMessage)) {
        await sendMessage(from, `You selected: ${userMessage}`);
        userStates[from] = { ...currentState, step: 'completed' };
      } else {
        await sendButtonMessage(from, 'Please select a valid option:', options);
      }
    }
  }
};

const sendMessage = async (to, text) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${phone_number_id}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
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
};

const sendButtonMessage = async (to, text, buttons) => {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${phone_number_id}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text },
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
    console.log('✅ Button message sent');
  } catch (error) {
    console.error('❌ Error sending message:', error.response?.data || error.message);
  }
};

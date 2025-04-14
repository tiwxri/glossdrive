const { getGreetingMessage } = require('../utils/greetings');  // Import greeting logic from utils

// Store user states
const userStates = {};

async function handleIncomingMessage(message) {
  const userId = message.from;
  const msg = message.body.trim().toLowerCase();

  console.log(`Received message: ${msg}`);  // Log the received message

  // Send greeting and button for "Call Now"
  if (msg) {
    const greeting = getGreetingMessage();  // Get greeting message based on time of day
    userStates[userId] = { step: 'greeted' };  // Track user state after greeting

    // Send the greeting and "Call Now" button to the user
    await message.reply(
      `${greeting} 👋\n\nHow can I assist you today? If you need help, click the button below to call now!`,
      {
        buttons: [
          {
            type: 'call',
            title: 'Call Now',
            payload: 'call_now', // Payload can be used for specific actions
          },
        ],
      }
    );
  }
}

module.exports = { handleIncomingMessage };

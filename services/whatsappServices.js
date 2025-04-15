const { getGreetingMessage } = require('../utils/greetings');
const { sendReply } = require('./messageSender');  // This can be another file that handles sending messages to the API.

async function handleIncomingMessage(userId, message) {
  const msg = message.body.trim().toLowerCase();
  
  if (msg === 'hi' || msg === 'hello') {
    const greeting = getGreetingMessage();
    const replyMessage = `${greeting} 👋\n\nHow can I assist you today?\n\nPlease select an option:\n1. Exterior Wash\n2. Interior Wash\n3. Full Car Cleaning`;
    
    // Send greeting and options
    await sendReply(userId, replyMessage);
  }

  // Handle selections after the user chooses an option
  else if (msg === '1' || msg === 'exterior wash') {
    const exteriorOptions = `You selected Exterior Wash. Please choose one of the following options:\n\n1. Window Shine\n2. Wheel Shine\n3. None`;
    await sendReply(userId, exteriorOptions);
  }
  else if (msg === '2' || msg === 'interior wash') {
    const interiorOptions = `You selected Interior Wash. Would you like any add-ons? Please choose one of the following:\n\n1. Vacuum\n2. Dusting\n3. None`;
    await sendReply(userId, interiorOptions);
  }
  else if (msg === '3' || msg === 'full car cleaning') {
    const fullCleaningOptions = `You selected Full Car Cleaning. Do you need any additional services?\n\n1. Window Shine\n2. Wheel Shine\n3. None`;
    await sendReply(userId, fullCleaningOptions);
  }
  else {
    // Default reply if the message doesn't match any known commands
    const defaultMessage = 'Sorry, I didn\'t understand that. Please reply with one of the options:\n1. Exterior Wash\n2. Interior Wash\n3. Full Car Cleaning';
    await sendReply(userId, defaultMessage);
  }
}

module.exports = { handleIncomingMessage };

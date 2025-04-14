const { getGreetingMessage } = require('../utils/greetings');
const client = require('./whatsappBot');

async function handleIncomingMessage(message) {
  const greeting = getGreetingMessage();

  await client.sendMessage(message.from, `${greeting} 👋\nWelcome to Gloss Drive! How can I assist you today?\n\n📞 Click here to Call Now`);
}

module.exports = { handleIncomingMessage };

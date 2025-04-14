const getGreetingMessage = require('../utils/greetings');  // Import greeting logic from utils

const userStates = {};  // Store user state

async function handleIncomingMessage(message) {
  const userId = message.from;
  const msg = message.body.trim().toLowerCase();

  // Log received message
  console.log(`Message received from ${userId}: ${msg}`);

  // Handle greetings
  if (['hi', 'hello', 'hey'].includes(msg)) {
    const greeting = getGreetingMessage();  // Get greeting message based on time
    userStates[userId] = { step: 'mainMenu' };

    await message.reply(
      `${greeting} 👋\n\nWhat are you looking for?\n\n1️⃣ Exterior wash\n2️⃣ Interior wash\n3️⃣ Full body cleaning (inside & outside)\n\nReply with 1, 2 or 3.`
    );
    return;
  }

  // Main menu options
  if (userStates[userId]?.step === 'mainMenu') {
    switch (msg) {
      case '1':
        userStates[userId] = { step: 'exteriorOptions' };
        await message.reply('You selected *Exterior Wash* 🚗\n\nPlease choose:\n\na️⃣ Wheel Polish\nb️⃣ Body Shine\nc️⃣ None');
        return;

      case '2':
        userStates[userId] = { step: 'interiorOptions' };
        await message.reply('You selected *Interior Wash* 🧼\n\nPlease choose:\n\na️⃣ AC Cleaning\nb️⃣ Rug & Seat Cleaning\nc️⃣ None');
        return;

      case '3':
        userStates[userId] = { step: 'done' };
        await message.reply('You selected *Full Body Cleaning* 🛁\n\nGreat! We\'ll include everything.');
        return;

      default:
        await message.reply('Please select a valid option (1, 2, or 3).');
        return;
    }
  }

  // Handling add-ons for options
  if (userStates[userId]?.step === 'exteriorOptions') {
    switch (msg) {
      case 'a':
        await message.reply('Wheel Polish added to your service!');
        break;
      case 'b':
        await message.reply('Body Shine added to your service!');
        break;
      case 'c':
        await message.reply('No add-ons selected.');
        break;
      default:
        await message.reply('Invalid option! Please choose a, b, or c.');
        return;
    }
    userStates[userId] = { step: 'done' };
    await message.reply('Thank you! We\'ll confirm your service shortly.');
    return;
  }

  if (userStates[userId]?.step === 'interiorOptions') {
    switch (msg) {
      case 'a':
        await message.reply('AC Cleaning added to your service!');
        break;
      case 'b':
        await message.reply('Rug & Seat Cleaning added to your service!');
        break;
      case 'c':
        await message.reply('No add-ons selected.');
        break;
      default:
        await message.reply('Invalid option! Please choose a, b, or c.');
        return;
    }
    userStates[userId] = { step: 'done' };
    await message.reply('Thank you! We\'ll confirm your service shortly.');
    return;
  }
}

module.exports = { handleIncomingMessage };

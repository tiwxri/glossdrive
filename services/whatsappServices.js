const getGreetingMessage = require('../utils/greetings');  // Import greeting logic from utils

// Simple in-memory state store for the user (can be replaced with DB or Redis)
const userStates = {};

async function handleIncomingMessage(message) {
  const userId = message.from;
  const msg = message.body.trim().toLowerCase();

  // Handle greetings
  if (['hi', 'hello', 'hey'].includes(msg)) {
    const greeting = getGreetingMessage();  // Get greeting message

    userStates[userId] = { step: 'mainMenu' };

    await message.reply(
      `${greeting} 👋\n\nWhat are you looking for?\n\n1️⃣ Exterior wash\n2️⃣ Interior wash\n3️⃣ Full body cleaning (inside & outside)\n\nReply with 1, 2 or 3.`
    );
    return;
  }

  // MAIN MENU OPTIONS
  if (userStates[userId]?.step === 'mainMenu') {
    switch (msg) {
      case '1':
        userStates[userId] = { step: 'exteriorOptions' };
        await message.reply(
          `You've selected *Exterior Wash* 🚗\n\nPlease choose one of the following:\n\na️⃣ Wheel Polish\nb️⃣ Body Shine\nc️⃣ None`
        );
        return;

      case '2':
        userStates[userId] = { step: 'interiorOptions' };
        await message.reply(
          `You've selected *Interior Wash* 🧼\n\nPlease choose one of the following:\n\na️⃣ AC Cleaning\nb️⃣ Rug & Seat Cleaning\nc️⃣ None`
        );
        return;

      case '3':
        userStates[userId] = { step: 'done' };
        await message.reply(
          `You've selected *Full Body Cleaning* 🛁\n\nGreat! We'll include:\n✅ Wheel Polish\n✅ Body Shine\n✅ AC Cleaning\n✅ Rug & Seat Cleaning\n\nOur team will reach out to you shortly. Thank you! 🙏`
        );
        return;

      default:
        await message.reply('Please select a valid option (1, 2 or 3).');
        return;
    }
  }

  // EXTERIOR OPTIONS
  if (userStates[userId]?.step === 'exteriorOptions') {
    switch (msg) {
      case 'a':
        await message.reply('✅ *Wheel Polish* added to your service!');
        break;
      case 'b':
        await message.reply('✅ *Body Shine* added to your service!');
        break;
      case 'c':
        await message.reply('No extra add-ons selected. 👍');
        break;
      default:
        await message.reply('Please choose a valid option: a, b, or c.');
        return;
    }

    userStates[userId] = { step: 'done' };
    await message.reply('✅ Thank you! Our team will reach out to confirm your booking.');
    return;
  }

  // INTERIOR OPTIONS
  if (userStates[userId]?.step === 'interiorOptions') {
    switch (msg) {
      case 'a':
        await message.reply('✅ *AC Cleaning* added to your service!');
        break;
      case 'b':
        await message.reply('✅ *Rug & Seat Cleaning* added to your service!');
        break;
      case 'c':
        await message.reply('No extra add-ons selected. 👍');
        break;
      default:
        await message.reply('Please choose a valid option: a, b, or c.');
        return;
    }

    userStates[userId] = { step: 'done' };
    await message.reply('✅ Thank you! Our team will reach out to confirm your booking.');
    return;
  }

  // Catch-all fallback
  await message.reply('Type "hi" to start the service selection process. 😊');
}

module.exports = { handleIncomingMessage };

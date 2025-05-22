const fs = require('fs');
const { transcribeAudio } = require('../services/transcribeService');
const { detectLanguage, translateText } = require('../services/languageService');
const { parseRideDetails } = require('../services/parserService');
const { saveRideToDB } = require('../services/dbService');
const { sendMessage } = require('../services/messageService');
const flowManager = require('../flows/carCleaningFlow');
const { getSession, saveSession } = require('../utils/sessionStore');
const { carCleaningFlow } = require('../flows/carCleaningFlow'); // NEW

async function handleIncomingMessage(sender, message, client) {
  if (!sender || !message) return;

  let content = '';
  let language = 'en'; // default

  // Check if message has media and is audio
  if (message.hasMedia) {
    const media = await message.downloadMedia();
    const extension = media.mimetype.split('/')[1];

    const filename = `./temp/audio.${extension}`;
    fs.writeFileSync(filename, Buffer.from(media.data, 'base64'));

    // Transcribe audio to text
    content = await transcribeAudio(filename);
    fs.unlinkSync(filename); // cleanup
    if (!content) {
      await sendMessage(sender, { type: 'text', text: "Sorry, I couldn't understand your audio message." });
      return;
    }
  } else {
    content = message.body || message; // If message is string, else from body
  }

  // 🔍 Check for car cleaning intent first
  if (isCarCleaningIntent(content)) {
    const reply = await carCleaningFlow(sender, content);
    if (reply) await sendMessage(sender, reply);
    return; // Skip ride logic
  }

  // 🌐 Detect language
  language = detectLanguage(content);

  // 🧠 Parse ride details
  const ride = parseRideDetails(content);
  if (!ride.from || !ride.to) {
    const prompt = await translateText("Please include both pickup and drop location.", language);
    await sendMessage(sender, { type: 'text', text: prompt });
    return;
  }

  // 💾 Save ride to DB
  await saveRideToDB({ ...ride, phone: sender, language });

  // ✅ Prepare confirmation message
  const confirmationMsg = `Your ride from ${ride.from} to ${ride.to} at ${ride.time || 'unknown time'} for ₹${ride.price || 'N/A'} has been saved!`;
  const translated = await translateText(confirmationMsg, language);

  // 🤝 Session flow
  const session = await getSession(sender);
  const { reply, nextSession } = await flowManager.processMessage(content, session, sender);

  if (!nextSession) {
    console.error('❌ Skipping save — invalid session:', nextSession);
    return;
  }

  await saveSession(sender, nextSession);

  await sendMessage(sender, { type: 'text', text: translated });

  if (reply && reply.type) {
    await sendMessage(sender, reply);
  } else {
    console.error('❌ Invalid reply format:', reply);
  }
}

// 🧠 Intent checker function
function isCarCleaningIntent(msg) {
  const lowerMsg = msg.toLowerCase();
  const keywords = [
    "car cleaning",
    "car cleaner",
    "car wash",
    "car detailing",
    "clean my car",
    "car polish",
    "car wash near me",
    "car cleaning in delhi"
  ];
  return keywords.some(k => lowerMsg.includes(k));
}

module.exports = { handleIncomingMessage, sendMessage };

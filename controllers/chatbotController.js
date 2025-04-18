const { sendMessage } = require('../services/messageService');
const flowManager = require('../flows/flowManager');
const { getSession, saveSession } = require('../utils/sessionStore'); // Firebase session store

async function handleIncomingMessage(sender, msgBody) {
  if (!sender || !msgBody) return;

  const session = await getSession(sender); // 🟢 Fetch from Firebase
  const { reply, nextSession } = await flowManager.processMessage(msgBody, session, sender);

  await saveSession(sender, nextSession); // 🟢 Save back to Firebase
  await sendMessage(sender, reply);
}

module.exports = { handleIncomingMessage, sendMessage };

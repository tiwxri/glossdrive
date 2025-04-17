const { sendMessage } = require('../services/messageService');
const flowManager = require('../flows/flowManager');

const sessions = global.sessions || (global.sessions = {});

function getSession(userId) {
  if (!sessions[userId]) {
    sessions[userId] = { stage: 'start' };
  }
  return sessions[userId];
}

function updateSession(userId, data) {
  sessions[userId] = {
    ...sessions[userId],
    ...data,
  };
}

async function handleIncomingMessage(sender, msgBody) {
  if (!sender || !msgBody) return;

  const session = getSession(sender);
  const { reply, nextSession } = await flowManager.processMessage(msgBody, session, sender);
  updateSession(sender, nextSession);

  await sendMessage(sender, reply);
}

module.exports = { handleIncomingMessage, sendMessage };

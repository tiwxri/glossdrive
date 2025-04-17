const { sendMessage } = require('../services/messageService');
const flowManager = require('../flows/flowManager');

// Temp in-memory session store
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

exports.handleIncomingMessage = async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const phone = entry?.messages?.[0]?.from;
  const msgBody = entry?.messages?.[0]?.text?.body;

  if (!phone || !msgBody) return res.sendStatus(200);

  const session = getSession(phone);
  const { reply, nextSession } = await flowManager.processMessage(msgBody, session, phone);
  updateSession(phone, nextSession);

  await sendMessage(phone, reply);
  res.sendStatus(200);
};

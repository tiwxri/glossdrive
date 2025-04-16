const { getSession, updateSession } = require('../services/firebaseService');
const { sendMessage } = require('../services/messageService');
const flowManager = require('../flows/flowManager');

exports.handleIncomingMessage = async (req, res) => {
  const entry = req.body.entry?.[0]?.changes?.[0]?.value;
  const phone = entry?.messages?.[0]?.from;
  const msgBody = entry?.messages?.[0]?.text?.body;

  if (!phone || !msgBody) return res.sendStatus(200);

  const session = await getSession(phone);
  const { reply, nextSession } = await flowManager.processMessage(msgBody, session, phone);
  await updateSession(phone, nextSession);

  await sendMessage(phone, reply);
  res.sendStatus(200);
};

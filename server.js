const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// ✅ Import your chatbot flow logic
const { handleMessageFlow, handlePostbackFlow } = require('./utils/flow');
const { getSession, updateSession } = require('./firebase');
const { sendMessage } = require('./utils/greetings');

// ✅ Middleware
app.use(express.json());
app.use(bodyParser.json());

// ✅ POST /webhook route
app.post('/webhook', async (req, res) => {
  const body = req.body;

  // ✅ Handle WhatsApp Cloud API Webhook
  if (body.object === 'whatsapp_business_account') {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages;

      if (!messages || messages.length === 0) {
        return res.sendStatus(200); // No messages to process
      }

      const message = messages[0];
      const from = message.from;

      let userMessage = '';

      if (message.text) {
        userMessage = message.text.body;
      } else if (message.button) {
        userMessage = message.button.text;
      } else if (message.list_reply) {
        userMessage = message.list_reply.title;
      } else {
        userMessage = 'Unsupported message type';
      }

      // ✅ Handle session and response for WhatsApp
      const session = await getSession(from);
      const newSession = await updateSession(from, userMessage, session);
      const reply = await handleMessageFlow(from, userMessage, newSession);
      await sendMessage(from, reply);

      return res.sendStatus(200);
    } catch (err) {
      console.error('Error handling WhatsApp message:', err);
      return res.sendStatus(500);
    }
  }

  // ✅ Handle Custom Chatbot Payloads (e.g. from your frontend)
  const { senderId, message, payload } = body;

  try {
    if (message) {
      const session = await getSession(senderId);
      const newSession = await updateSession(senderId, message, session);
      const reply = await handleMessageFlow(senderId, message, newSession);
      res.json({ senderId, responseMessage: reply });
    } else if (payload) {
      handlePostbackFlow(senderId, payload, (senderId, responseMessage) => {
        res.json({ senderId, responseMessage });
      });
    } else {
      res.status(400).send('Invalid request');
    }
  } catch (err) {
    console.error('Error handling frontend chatbot message:', err);
    res.sendStatus(500);
  }
});

// ✅ GET route for webhook verification (WhatsApp)
app.get('/webhook', (req, res) => {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'your_custom_verify_token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

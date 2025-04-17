require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const webhookRoutes = require('./routes/webhook');

const app = express();

// Middleware
app.use(bodyParser.json());

// Webhook route for WhatsApp incoming messages
app.use('/webhook', webhookRoutes);

// Meta verification endpoint (GET)
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your_verify_token';

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log("✅ WEBHOOK VERIFIED");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

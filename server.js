const express = require('express');
const bodyParser = require('body-parser');
const webhookRoute = require('./routes/webhook');
const { startWhatsAppBot } = require('./services/whatsappBot'); // Bot starter

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// Webhook route
app.use('/api', webhookRoute);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Start the WhatsApp bot
startWhatsAppBot();

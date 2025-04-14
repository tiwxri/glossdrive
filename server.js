const express = require('express');
const { client } = require('./config/client');
const webhookRoute = require('./routes/webhook');
const sendGreeting = require("./utils/greetings"); // Import greeting

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/webhook', webhookRoute);

client.on('ready', () => {
  console.log('✅ WhatsApp client is ready!');
});

client.initialize();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

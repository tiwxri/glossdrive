const express = require('express');
const bodyParser = require('body-parser');
const webhookRoutes = require('./routes/webhook');
require('./services/whatsappBot'); // start WhatsApp bot

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/api', webhookRoutes);

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

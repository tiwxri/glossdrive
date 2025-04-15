// server.js
const express = require('express');
const bodyParser = require('body-parser');
const webhookRoutes = require('./routes/webhook');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());
app.use('/webhook', webhookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
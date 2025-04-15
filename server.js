const express = require('express');
const app = express();
const webhookRouter = require('./routes/webhook');

// Middleware to parse incoming JSON requests
app.use(express.json());

// Mount the webhook router
app.use('/webhook', webhookRouter);

// Start the server on a specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

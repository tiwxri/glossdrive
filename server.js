const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// ❌ FIX: Don't import functions from webhook route file
// ✅ FIX: Remove this incorrect import
// const { handleMessageFlow, handlePostbackFlow } = require('./routes/webhook');

// ✅ FIX: Move handlers to their own logic file (e.g., utils/flow.js)
const { handleMessageFlow, handlePostbackFlow } = require('./utils/flow');

// Import the router (if you still want to mount it)
const webhookRouter = require('./routes/webhook');

// ✅ Correct order: Express JSON middleware should come before router
app.use(express.json());
app.use(bodyParser.json()); // Still included per your instruction
app.use('/webhook', webhookRouter);

// ✅ FIX: Ensure you are not duplicating the route
// If you're keeping this route definition, remove this from routes/webhook.js or vice versa
app.post('/webhook', (req, res) => {
  const senderId = req.body.senderId;
  const message = req.body.message;
  const payload = req.body.payload;

  if (message) {
    handleMessageFlow(senderId, message, (senderId, responseMessage) => {
      res.json({ senderId, responseMessage });
    });
  } else if (payload) {
    handlePostbackFlow(senderId, payload, (senderId, responseMessage) => {
      res.json({ senderId, responseMessage });
    });
  } else {
    res.status(400).send('Invalid request');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

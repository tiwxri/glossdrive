const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// ✅ Flow logic functions
const { handleMessageFlow, handlePostbackFlow } = require('./utils/flow');

// ✅ Middleware
app.use(express.json());
app.use(bodyParser.json());

// ✅ POST /webhook route
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

// ✅ Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

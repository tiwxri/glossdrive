const express = require('express');
const bodyParser = require('body-parser');
const webhookRoute = require('./routes/webhook');  // Import webhook route

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Link the webhook route
app.use('/api', webhookRoute);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

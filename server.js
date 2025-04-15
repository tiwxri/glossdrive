const express = require('express');
const app = express();

// Apply JSON parser only to POST requests on /webhook
app.use('/webhook', (req, res, next) => {
  if (req.method === 'POST') {
    express.json({
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    })(req, res, next);
  } else {
    next(); // allow GET requests through without JSON parsing
  }
});

// Routes
const webhookRoutes = require('./routes/webhook');
app.use('/webhook', webhookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

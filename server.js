const express = require('express');
const app = express();

// Body parser
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf; // in case you need raw body for webhook verification
  }
}));

// Routes
const webhookRoutes = require('./routes/webhook');
app.use('/webhook', webhookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

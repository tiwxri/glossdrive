const express = require('express');
const router = express.Router();

// Placeholder webhook
router.post('/webhook', (req, res) => {
  console.log('Received webhook:', req.body);
  res.status(200).send('OK');
});

module.exports = router;

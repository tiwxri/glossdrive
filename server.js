// Initialize and run the bot server
const express = require('express');
const bodyParser = require('body-parser');
const webhookRouter = require('./routes/webhook');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use('/webhook', webhookRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

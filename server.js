const express = require("express");
const bodyParser = require("body-parser");
const webhookRoute = require("./routes/webhook");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/webhook", webhookRoute);

app.get("/", (req, res) => {
  res.send("GlossDrive WhatsApp Bot is running 🚗💨");
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
const express = require("express");
const sendGreeting = require("./utils/greeting"); // Import greeting
const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];
  const phoneNumber = message?.from;

  if (message && message.type === "text") {
    await sendGreeting(phoneNumber);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

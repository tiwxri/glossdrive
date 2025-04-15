// routes/webhook.js

const express = require("express");
const router = express.Router();
const axios = require("axios");
const { getGreeting, getTimeSlots } = require("../utils/time");
const { generateReply } = require("../utils/flow");

require("dotenv").config();

router.post("/", async (req, res) => {
  const body = req.body;

  if (body.object) {
    const entry = body.entry?.[0]?.changes?.[0]?.value;
    const phoneNumberId = entry?.metadata?.phone_number_id;
    const messages = entry?.messages;

    if (messages && messages[0]) {
      const from = messages[0].from;
      const msgBody = messages[0].text?.body || "";

      // Simulate a basic in-memory context (for testing)
      const userContext = global.userContext || {};
      if (!userContext[from]) userContext[from] = {};
      global.userContext = userContext;

      const reply = await generateReply(msgBody, userContext[from]);

      try {
        await axios({
          method: "POST",
          url: `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          },
          data: {
            messaging_product: "whatsapp",
            to: from,
            type: reply.type,
            [reply.type]: reply.message,
          },
        });
      } catch (error) {
        console.error("❌ Error sending message:", error.response?.data || error);
      }
    }

    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;

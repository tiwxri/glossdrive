const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Webhook verification
app.get('/webhook', (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// Handling incoming messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object) {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messageObj = value?.messages?.[0];

    if (messageObj && messageObj.from) {
      const from = messageObj.from;

      // Generate IST-based greeting
      const currentISTHour = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "numeric", hour12: false });
      let greeting = "Hello";
      if (currentISTHour < 12) greeting = "Good morning";
      else if (currentISTHour < 18) greeting = "Good afternoon";
      else greeting = "Good evening";

      // Message body
      const messageData = {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: from,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: `${greeting}! 👋\n\nWelcome to GlossDrive.\nPlease select a service below:`
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "exterior_wash",
                  title: "Exterior Wash"
                }
              },
              {
                type: "reply",
                reply: {
                  id: "interior_wash",
                  title: "Interior Wash"
                }
              },
              {
                type: "reply",
                reply: {
                  id: "full_cleaning",
                  title: "Full Car Cleaning"
                }
              }
            ]
          }
        }
      };

      // Send message via WhatsApp API
      try {
        await axios.post(
          `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
          messageData,
          {
            headers: {
              Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
              "Content-Type": "application/json"
            }
          }
        );
        console.log("Greeting sent!");
      } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
      }
    }
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

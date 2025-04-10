// server.js
require("dotenv").config();
import express from "express";
import { json } from "body-parser";
import { post } from "axios";

const app = express();
app.use(json());

// Store user session temporarily in memory
const sessions = {};

// Meta WhatsApp Webhook Verification
app.get("/webhook", (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token && mode === "subscribe" && token === verify_token) {
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// WhatsApp message handler
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];
  const phone_number = message?.from;
  const msg_body = message?.text?.body;

  if (!message || !phone_number) return res.sendStatus(200);

  if (!sessions[phone_number]) {
    sessions[phone_number] = { step: 0, data: {} };
  }

  const session = sessions[phone_number];
  let reply = "";

  switch (session.step) {
    case 0:
      reply =
        "Hi there! 👋 Welcome to *10Min Car Clean* — your car's best friend! 🚗✨\nPlease choose a service:\n1. 🚘 Exterior Wash\n2. 🧼 Interior Detailing\n3. 🧽 Full Body Cleaning\n4. 📦 Monthly Subscription";
      session.step = 1;
      break;

    case 1:
      const services = {
        "1": "Exterior Wash",
        "2": "Interior Detailing",
        "3": "Full Body Cleaning",
        "4": "Monthly Subscription",
      };
      if (!services[msg_body]) {
        reply = "❌ Invalid choice. Please reply with 1, 2, 3, or 4.";
        break;
      }
      session.data.service = services[msg_body];
      session.step = 2;
      reply = "Great choice! 🚀\nPlease tell us your *car company and model* (e.g., Honda City 2022).";
      break;

    case 2:
      session.data.car_model = msg_body;
      session.step = 3;
      reply = "Awesome. Now please *share your current location* 📍 or type your address below.";
      break;

    case 3:
      session.data.user_location = msg_body;
      session.step = 4;
      reply = `Here's the payment link for *${session.data.service}* 💳:\nhttps://rzp.io/l/samplePaymentLink\nPlease complete the payment and we’ll confirm your booking.`;
      break;

    default:
      reply = "🙏 Thank you! We’ve received your request. If you want to book another service, type 'Hi'.";
  }

  // Send response via WhatsApp API
  await post(
    "https://graph.facebook.com/v18.0/" + process.env.PHONE_NUMBER_ID + "/messages",
    {
      messaging_product: "whatsapp",
      to: phone_number,
      text: { body: reply },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running on port " + PORT));

require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();

// ✅ Parse JSON & preserve raw body if needed
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

// 🧠 In-memory session store
const sessions = {};

// 🔐 Webhook Verification for WhatsApp
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

// 📬 Incoming WhatsApp Message Handler
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];
  const phone_number = message?.from;
  const msg_body = message?.text?.body?.toLowerCase() || message?.button?.text?.toLowerCase();
  const button_id = message?.button?.payload || message?.button?.id;

  if (!message || !phone_number) return res.sendStatus(200);

  if (!sessions[phone_number]) {
    sessions[phone_number] = { step: 0, data: {} };
  }

  const session = sessions[phone_number];
  let reply = "";

  // ✅ Handle greetings or reset
  if (msg_body === "hey" || msg_body === "hey!" || msg_body === "hi") {
    session.step = 0;
  }

  switch (session.step) {
    case 0:
      // Send interactive button menu
      await axios.post(
        `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
        {
          messaging_product: "whatsapp",
          to: phone_number,
          type: "interactive",
          interactive: {
            type: "button",
            body: {
              text:
                "Hi there! 👋 Welcome to *10Min Car Clean* — your car's best friend! 🚗✨\nPlease choose a service:",
            },
            action: {
              buttons: [
                {
                  type: "reply",
                  reply: {
                    id: "service_1",
                    title: "🚘 Exterior Wash",
                  },
                },
                {
                  type: "reply",
                  reply: {
                    id: "service_2",
                    title: "🧼 Interior Detailing",
                  },
                },
                {
                  type: "reply",
                  reply: {
                    id: "service_3",
                    title: "🧽 Full Body Cleaning",
                  },
                },
                {
                  type: "reply",
                  reply: {
                    id: "service_4",
                    title: "📦 Monthly Subscription",
                  },
                },
              ],
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );
      session.step = 1;
      break;

    case 1:
      // Handle button reply IDs
      const services = {
        service_1: "Exterior Wash",
        service_2: "Interior Detailing",
        service_3: "Full Body Cleaning",
        service_4: "Monthly Subscription",
      };

      const selectedService = services[button_id];

      if (!selectedService) {
        reply = "❌ Invalid selection. Please tap one of the buttons.";
        break;
      }

      session.data.service = selectedService;
      session.step = 2;
      reply =
        "Great choice! 🚀\nPlease tell us your *car company and model* (e.g., Honda City 2022).";
      break;

    case 2:
      session.data.car_model = msg_body;
      session.step = 3;
      reply =
        "Awesome. Now please *share your current location* 📍 or type your address below.";
      break;

    case 3:
      session.data.user_location = msg_body;
      session.step = 4;
      reply = `Here's the payment link for *${session.data.service}* 💳:\nhttps://rzp.io/l/samplePaymentLink\nPlease complete the payment and we’ll confirm your booking.`;
      break;

    default:
      reply =
        "🙏 Thank you! We’ve received your request. If you want to book another service, type 'Hi'.";
  }

  // Only send text reply if it's not handled via button interaction
  if (reply) {
    await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
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
  }

  res.sendStatus(200);
});

// 🚀 Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Bot running on port " + PORT));

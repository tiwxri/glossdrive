require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);

const sessions = {};

// Verification Route
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

// WhatsApp Webhook Receiver
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    const phone_number = message?.from;
    const msg_type = message?.type;

    if (!message || !phone_number) return res.sendStatus(200);

    // 🔍 Parse message body and button replies
    let msg_body = "";
    let button_id = "";

    if (msg_type === "button") {
      msg_body = message.button.text?.toLowerCase();
      button_id = message.button.payload || message.button.id;
    } else if (msg_type === "text") {
      msg_body = message.text.body?.toLowerCase();
    }

    console.log("Incoming message:", msg_body, "Button ID:", button_id);

    // Session management
    if (!sessions[phone_number]) {
      sessions[phone_number] = { step: 0, data: {} };
    }

    const session = sessions[phone_number];
    let reply = "";

    // Handle greeting
    if (["hi", "hey", "hello"].includes(msg_body)) {
      session.step = 0;
    }

    switch (session.step) {
      case 0:
        // Send interactive buttons
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
                    reply: { id: "service_1", title: "🚘 Exterior Wash" },
                  },
                  {
                    type: "reply",
                    reply: { id: "service_2", title: "🧼 Interior Detailing" },
                  },
                  {
                    type: "reply",
                    reply: { id: "service_3", title: "🧽 Full Body Cleaning" },
                  },
                  {
                    type: "reply",
                    reply: { id: "service_4", title: "📦 Monthly Subscription" },
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
        const services = {
          service_1: "Exterior Wash",
          service_2: "Interior Detailing",
          service_3: "Full Body Cleaning",
          service_4: "Monthly Subscription",
        };

        const selected = services[button_id];

        if (!selected) {
          reply = "❌ Invalid selection. Please tap one of the service buttons.";
          break;
        }

        session.data.service = selected;
        session.step = 2;
        reply = "Great choice! 🚀\nPlease tell us your *car company and model* (e.g., Honda City 2022).";
        break;

      case 2:
        session.data.car_model = msg_body;
        session.step = 3;
        reply = "Awesome. Now please *share your current location* 📍 or type your address.";
        break;

      case 3:
        session.data.user_location = msg_body;
        session.step = 4;
        reply = `Here's the payment link for *${session.data.service}* 💳:\nhttps://rzp.io/l/samplePaymentLink\nPlease complete the payment to confirm your booking.`;
        break;

      default:
        reply = "🙏 Thank you! We've received your request. To book again, type 'Hi'.";
    }

    // Only send if there's a text reply
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
  } catch (error) {
    console.error("Error in /webhook:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Bot running on port " + PORT));

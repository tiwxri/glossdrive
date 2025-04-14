require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const sessions = {};

// Helpers
const getGreeting = () => {
  const hour = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: "2-digit", hour12: false });
  if (hour < 12) return "Good Morning 🌞";
  if (hour < 17) return "Good Afternoon ☀️";
  return "Good Evening 🌙";
};

const getTimeSlots = () => {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const currentHour = now.getHours();
  const slots = [];

  for (let i = 0; i < 3; i++) {
    const start = currentHour + i;
    const end = start + 1;
    if (end <= 22) {
      slots.push(`${start}:00 - ${end}:00`);
    }
  }

  return slots;
};

const sendText = async (to, body) => {
  await axios.post(
    `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      text: { body },
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
};

const generateOrderId = () => {
  return "ORDER-" + Math.random().toString(36).substr(2, 8).toUpperCase();
};

// Webhook Verification
app.get("/webhook", (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Webhook Message Receiver
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const userMessage = message.text?.body?.toLowerCase();
    let session = sessions[from] || { step: 0, data: {} };
    sessions[from] = session;

    switch (session.step) {
      case 0:
        await sendText(from, `${getGreeting()}! Welcome to *10Min Car Clean* 🚗✨\n\nPlease choose a service:\n1. Exterior Wash\n2. Interior Detailing\n3. Full Body Cleaning`);
        session.step = 1;
        break;

      case 1:
        if (["1", "2", "3"].includes(userMessage)) {
          session.data.service = userMessage;
          await sendText(from, `Any add-ons?\n1. Wheel Shine\n2. Body Shine\n3. All of them\n4. None`);
          session.step = 2;
        } else {
          await sendText(from, "❌ Invalid input. Please choose 1, 2, or 3.");
        }
        break;

      case 2:
        if (["1", "2", "3", "4"].includes(userMessage)) {
          session.data.addon = userMessage;
          const slots = getTimeSlots();
          let slotMsg = "Please select a time slot:\n";
          slots.forEach((s, i) => slotMsg += `${i + 1}. ${s}\n`);
          session.data.slots = slots;
          await sendText(from, slotMsg);
          session.step = 3;
        } else {
          await sendText(from, "❌ Invalid input. Choose from 1, 2, 3, or 4.");
        }
        break;

      case 3:
        if (["1", "2", "3"].includes(userMessage)) {
          session.data.time = session.data.slots[parseInt(userMessage) - 1];

          // Pricing logic (dummy)
          let price = 200;
          if (session.data.service === "2") price = 300;
          if (session.data.service === "3") price = 400;
          if (session.data.addon === "3") price += 100;

          session.data.price = price;

          await sendText(from, `Here’s your summary:\n\nService: ${session.data.service}\nAdd-on: ${session.data.addon}\nTime: ${session.data.time}\nTotal: ₹${price}\n\nWould you like to:\n1. Make Payment\n2. Start Again`);
          session.step = 4;
        } else {
          await sendText(from, "❌ Invalid slot. Choose 1, 2, or 3.");
        }
        break;

      case 4:
        if (userMessage === "1") {
          const orderId = generateOrderId();
          await sendText(from, `✅ Payment successful!\nYour booking is confirmed.\nOrder ID: *${orderId}*`);
          session.step = 5;
        } else if (userMessage === "2") {
          sessions[from] = { step: 0, data: {} };
          await sendText(from, "🔁 Starting again...\nPlease choose a service:\n1. Exterior Wash\n2. Interior Detailing\n3. Full Body Cleaning");
          session.step = 1;
        } else {
          await sendText(from, "❌ Invalid input. Type 1 or 2.");
        }
        break;

      default:
        await sendText(from, "Type *Hi* to start again.");
        session.step = 0;
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

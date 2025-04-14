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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning ☀️";
  else if (hour < 18) return "Good afternoon 🌞";
  else return "Good evening 🌙";
};

const getTimeSlots = () => {
  const now = new Date();
  const hour = now.getHours();
  const slots = [];

  for (let i = 1; i <= 3; i++) {
    const start = hour + i;
    const end = start + 1;
    if (end <= 23) {
      slots.push(`${start}:00 - ${end}:00`);
    }
  }
  return slots;
};

const sendText = async (to, body) => {
  return axios.post(
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

const sendButtons = async (to, bodyText, buttons) => {
  return axios.post(
    `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map((b) => ({
            type: "reply",
            reply: { id: b.id, title: b.title },
          })),
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
};

// Webhook Verification
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

// Webhook Logic
app.post("/webhook", async (req, res) => {
  try {
    const message = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const phone_number = message?.from;
    const msg_type = message?.type;

    if (!message || !phone_number) return res.sendStatus(200);

    let msg_body = "";
    let button_id = "";

    if (msg_type === "button") {
      msg_body = message.interactive?.button_reply?.title?.toLowerCase();
      button_id = message.interactive?.button_reply?.id;
    } else if (msg_type === "text") {
      msg_body = message.text?.body?.toLowerCase();
    }

    if (!sessions[phone_number]) {
      sessions[phone_number] = { step: 0, data: {} };
    }

    const session = sessions[phone_number];
    const greeting = getGreeting();

    switch (session.step) {
      case 0:
        await sendText(
          phone_number,
          `${greeting} 👋 Welcome to *10Min Car Clean*! 🚗✨`
        );
        await sendButtons(phone_number, "Please choose a service:", [
          { id: "service_1", title: "🚘 Exterior Wash" },
          { id: "service_2", title: "🧼 Interior Detailing" },
          { id: "service_3", title: "🧽 Full Body Cleaning" },
        ]);
        session.step = 1;
        break;

      case 1:
        if (!["service_1", "service_2", "service_3"].includes(button_id)) {
          await sendText(phone_number, "❌ Invalid option. Please tap a button.");
          return res.sendStatus(200);
        }

        session.data.service = button_id;

        if (button_id === "service_1") {
          await sendButtons(phone_number, "Choose add-ons for Exterior Wash:", [
            { id: "ext_1", title: "Wheel Shine" },
            { id: "ext_2", title: "Body Shine" },
            { id: "ext_3", title: "Both" },
          ]);
          session.step = 2;
        } else if (button_id === "service_2") {
          await sendButtons(phone_number, "Choose add-ons for Interior Detailing:", [
            { id: "int_1", title: "AC Vents" },
            { id: "int_2", title: "Rug Cleaning" },
            { id: "int_3", title: "Seat Cleaning" },
            { id: "int_4", title: "All of them" },
          ]);
          session.step = 2;
        } else {
          session.data.addon = "None";
          const slots = getTimeSlots();
          await sendButtons(phone_number, "Select a preferred time slot:", [
            { id: "slot_1", title: slots[0] },
            { id: "slot_2", title: slots[1] },
            { id: "slot_3", title: slots[2] },
          ]);
          session.step = 3;
        }
        break;

      case 2:
        const validAddOns = [
          "ext_1", "ext_2", "ext_3", "int_1", "int_2", "int_3", "int_4",
        ];
        if (!validAddOns.includes(button_id)) {
          await sendText(phone_number, "❌ Invalid option. Please tap a button.");
          return res.sendStatus(200);
        }

        session.data.addon = button_id;
        const slots = getTimeSlots();
        await sendButtons(phone_number, "Select a preferred time slot:", [
          { id: "slot_1", title: slots[0] },
          { id: "slot_2", title: slots[1] },
          { id: "slot_3", title: slots[2] },
        ]);
        session.step = 3;
        break;

      case 3:
        const slotIds = ["slot_1", "slot_2", "slot_3"];
        if (!slotIds.includes(button_id)) {
          await sendText(phone_number, "❌ Invalid option. Please tap a button.");
          return res.sendStatus(200);
        }

        const selectedSlot = getTimeSlots()[parseInt(button_id.split("_")[1]) - 1];
        session.data.slot = selectedSlot;

        const serviceMap = {
          service_1: "Exterior Wash",
          service_2: "Interior Detailing",
          service_3: "Full Body Cleaning",
        };

        const addonMap = {
          ext_1: "Wheel Shine",
          ext_2: "Body Shine",
          ext_3: "Wheel & Body Shine",
          int_1: "AC Vents",
          int_2: "Rug Cleaning",
          int_3: "Seat Cleaning",
          int_4: "All Add-ons",
          None: "None",
        };

        await sendText(
          phone_number,
          `✅ *Booking Confirmed!*\n\n*Service:* ${serviceMap[session.data.service]}\n*Add-on:* ${addonMap[session.data.addon]}\n*Time:* ${selectedSlot}\n\nThank you for choosing 10Min Car Clean! 🧼🚘`
        );

        // Reset session for next booking
        delete sessions[phone_number];
        break;

      default:
        await sendText(phone_number, "Say *Hi* to begin a new booking.");
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Bot running on port " + PORT));

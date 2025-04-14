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

// Webhook logic to start conversation
app.post("/webhook", async (req, res) => {
  try {
    const value = req.body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    if (!message) return res.sendStatus(200);

    const phone_number = message?.from;
    const msg_type = message?.type;

    let userInput = "";
    let buttonId = "";

    if (msg_type === "button") {
      buttonId = message.interactive?.button_reply?.id;
      userInput = message.interactive?.button_reply?.title?.toLowerCase();
    } else if (msg_type === "text") {
      userInput = message.text?.body?.toLowerCase();
    }

    const session = { step: 0, data: {} };

    switch (session.step) {
      case 0:
        await sendText(phone_number, "👋 Hello! Welcome to our Car Cleaning Service. What are you looking for?");
        await sendButtons(phone_number, "Please choose a service:", [
          { id: "service_1", title: "🚘 Exterior Wash" },
          { id: "service_2", title: "🧼 Interior Wash" },
          { id: "service_3", title: "🧽 Full Body Cleaning (Inside and Outside)" },
        ]);
        session.step = 1;
        break;

      case 1:
        if (!["service_1", "service_2", "service_3"].includes(buttonId)) {
          await sendText(phone_number, "❌ Invalid option. Please tap a button.");
          return res.sendStatus(200);
        }

        session.data.service = buttonId;

        // Handle sub-options based on service selected
        if (buttonId === "service_1") {
          await sendButtons(phone_number, "Choose add-ons for Exterior Wash:", [
            { id: "ext_1", title: "Wheel Polish" },
            { id: "ext_2", title: "Body Shine" },
            { id: "ext_3", title: "None" },
          ]);
          session.step = 2;
        } else if (buttonId === "service_2") {
          await sendButtons(phone_number, "Choose add-ons for Interior Wash:", [
            { id: "int_1", title: "AC Cleaning" },
            { id: "int_2", title: "Rug and Seat Cleaning" },
            { id: "int_3", title: "None" },
          ]);
          session.step = 2;
        } else {
          // Full body cleaning automatically includes all options
          session.data.addons = ["AC Cleaning", "Rug and Seat Cleaning", "Wheel Polish", "Body Shine"];
          await sendText(phone_number, `✅ You've selected the Full Body Cleaning package.\n\nAdd-ons included: Wheel Polish, Body Shine, AC Cleaning, and Rug/Seat Cleaning.`);
          session.step = 3;
        }
        break;

      case 2:
        // Process selected add-ons
        if (buttonId === "ext_1" || buttonId === "ext_2" || buttonId === "ext_3") {
          session.data.addon = buttonId === "ext_1" ? "Wheel Polish" : buttonId === "ext_2" ? "Body Shine" : "None";
        } else if (buttonId === "int_1" || buttonId === "int_2" || buttonId === "int_3") {
          session.data.addon = buttonId === "int_1" ? "AC Cleaning" : buttonId === "int_2" ? "Rug and Seat Cleaning" : "None";
        }

        // Confirmation of selected service and add-ons
        await sendText(phone_number, `✅ You've selected:\n\nService: ${session.data.service}\nAdd-on(s): ${session.data.addon || 'None'}`);
        session.step = 3;
        break;

      default:
        await sendText(phone_number, "Type *Hi* to start a new booking.");
        session.step = 0;
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error.message);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🚀 Bot running on port " + PORT));

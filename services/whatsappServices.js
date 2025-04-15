
// File: services/whatsappServices.js
const axios = require("axios");
const { getGreetingMessage, getServiceMenu } = require("../utils/greetings");

const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;

async function handleMessage(message) {
  const from = message.from;
  const msgBody = message.text?.body?.toLowerCase();

  if (msgBody === "hi" || msgBody === "hello") {
    await sendTextMessage(from, getGreetingMessage());
    await sendServiceMenu(from);
  }
}

async function sendTextMessage(to, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Error sending text message:", err.response?.data || err);
  }
}

async function sendServiceMenu(to) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: getServiceMenu(),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Error sending menu:", err.response?.data || err);
  }
}

module.exports = { handleMessage };

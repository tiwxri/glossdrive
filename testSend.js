require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();

// ✅ Replacing body-parser with express.json() and preserving raw body
app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString(); // Optional: useful if you need raw body for signature verification later
    },
  })
);

// Store user session temporarily in memory (to track conversation states)
const sessions = {};

// Meta WhatsApp Webhook Verification Endpoint
app.get("/webhook", (req, res) => {
  const verify_token = process.env.VERIFY_TOKEN; // The token you set in the Meta Developer console
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Check if the request is coming from Facebook and if the verification token matches
  if (mode && token && mode === "subscribe" && token === verify_token) {
    return res.status(200).send(challenge); // Respond with the challenge
  } else {
    return res.sendStatus(403); // Forbidden if the verification fails
  }
});

// WhatsApp Message Handler Endpoint
app.post("/webhook", async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const message = changes?.value?.messages?.[0];

  if (!message) {
    return res.sendStatus(200); // If no message is received, ignore the request
  }

  const phone_number = message.from; // The phone number sending the message
  const msg_body = message.text?.body; // The text of the incoming message

  if (!phone_number || !msg_body) {
    return res.sendStatus(200); // If message doesn't contain the required information, ignore it
  }

  // If a session doesn't exist for this user, create it
  if (!sessions[phone_number]) {
    sessions[phone_number] = { step: 0, data: {} };
  }

  const session = sessions[phone_number];
  let reply = "";

  // Session flow for interacting with the user
  switch (session.step) {
    case 0:
      reply =
        "Hi there! 👋 Welcome to *10Min Car Clean* — your car's best friend! 🚗✨\nPlease choose a service:\n1. 🚘 Exterior Wash\n2. 🧼 Interior Detailing\n3. 🧽 Full Body Cleaning\n4. 📦 Monthly Subscription";
      session.step = 1; // Move to the next step
      break;

    case 1:
      // Define services
      const services = {
        "1": "Exterior Wash",
        "2": "Interior Detailing",
        "3": "Full Body Cleaning",
        "4": "Monthly Subscription",
      };

      // Handle invalid input
      if (!services[msg_body]) {
        reply = "❌ Invalid choice. Please reply with 1, 2, 3, or 4.";
        break;
      }

      session.data.service = services[msg_body];
      session.step = 2; // Move to the next step
      reply = "Great choice! 🚀\nPlease tell us your *car company and model* (e.g., Honda City 2022).";
      break;

    case 2:
      session.data.car_model = msg_body;
      session.step = 3; // Move to the next step
      reply = "Awesome. Now please *share your current location* 📍 or type your address below.";
      break;

    case 3:
      session.data.user_location = msg_body;
      session.step = 4; // Move to the next step
      reply = `Here's the payment link for *${session.data.service}* 💳:\nhttps://rzp.io/l/samplePaymentLink\nPlease complete the payment and we’ll confirm your booking.`;
      break;

    default:
      reply = "🙏 Thank you! We’ve received your request. If you want to book another service, type 'Hi'.";
  }

  // Send the response message back to the user via the WhatsApp API
  try {
    await sendMessage(phone_number, reply);
  } catch (error) {
    console.error("Error sending message:", error.response?.data || error.message);
    reply = "Sorry, something went wrong! Please try again later.";
    await sendMessage(phone_number, reply); // Send error message to user
  }

  res.sendStatus(200); // Acknowledge receipt of the request
});

// Function to send a message via WhatsApp API
async function sendMessage(phone_number, message) {
  const url = `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: "whatsapp",
    to: phone_number,
    text: { body: message },
  };

  const headers = {
    Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
    "Content-Type": "application/json",
  };

  const response = await axios.post(url, payload, { headers });
  if (response.status !== 200) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }
  console.log("Message sent successfully:", response.data);
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));

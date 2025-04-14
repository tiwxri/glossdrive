const axios = require("axios");
require("dotenv").config();

const sendGreeting = async (to) => {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "👋 Hey there! What kind of service are you looking for today?",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "exterior_wash",
                  title: "Exterior Wash",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "interior_wash",
                  title: "Interior Wash",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "full_body_cleaning",
                  title: "Full Cleaning",
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
    console.log("✅ Greeting sent!");
    return response.data;
  } catch (error) {
    console.error("❌ Error sending greeting:", error.response?.data || error.message);
  }
};

module.exports = sendGreeting;

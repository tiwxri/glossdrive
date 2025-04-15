function getGreetingMessage() {
    const currentHour = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata", hour: '2-digit', hour12: false });
    const hour = parseInt(currentHour);
  
    if (hour < 12) return "Good morning! Welcome to GlossDrive 🚗✨";
    if (hour < 18) return "Good afternoon! Welcome to GlossDrive 🚗✨";
    return "Good evening! Welcome to GlossDrive 🚗✨";
  }
  
  function getServiceMenu() {
    return {
      type: "button",
      body: {
        text: "What service are you looking for?",
      },
      action: {
        buttons: [
          { type: "reply", reply: { id: "ext_wash", title: "Exterior Wash" } },
          { type: "reply", reply: { id: "int_wash", title: "Interior Wash" } },
          { type: "reply", reply: { id: "full_clean", title: "Full Car Cleaning" } },
        ],
      },
    };
  }
  
  module.exports = { getGreetingMessage, getServiceMenu };
  
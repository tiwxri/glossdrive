// utils/messageTemplates.js

const getGreeting = () => {
    const now = new Date();
    const istHour = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })).getHours();
  
    if (istHour < 12) return "Good morning ☀️";
    else if (istHour < 18) return "Good afternoon 🌞";
    else return "Good evening 🌙";
  };
  
  module.exports = {
    getGreeting,
  };
  
// utils/greetings.js
function getGreetingMessage() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }
  
  module.exports = { getGreetingMessage };
  
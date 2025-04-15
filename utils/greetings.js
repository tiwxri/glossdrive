// Get a greeting message based on the current time in IST
function getTimeBasedGreeting() {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good morning";
    if (currentHour < 18) return "Good afternoon";
    return "Good evening";
  }
  
  module.exports = { getTimeBasedGreeting };
  
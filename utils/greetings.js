// Get a greeting message based on the current time in IST
function getGreetingMessage() {
    const currentHour = new Date().getHours();
    
    if (currentHour < 12) {
      return 'Good morning';
    } else if (currentHour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }
  
  module.exports = { getGreetingMessage };  
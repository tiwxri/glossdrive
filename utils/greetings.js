// Function to return greeting based on time of the day
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
  
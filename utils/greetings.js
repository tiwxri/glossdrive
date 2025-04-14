function getGreetingMessage() {
    const now = new Date();
    const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const hour = istNow.getHours();
  
    if (hour >= 5 && hour < 12) return '🌅 Good morning!';
    if (hour >= 12 && hour < 17) return '🌞 Good afternoon!';
    if (hour >= 17 && hour < 21) return '🌇 Good evening!';
    return '🌙 Good night!';
  }
  
  module.exports = getGreetingMessage;
  
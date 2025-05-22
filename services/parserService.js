function extractRideBookingDetails(text) {
    const fromMatch = text.match(/from (\w+)/i);
    const toMatch = text.match(/to (\w+)/i);
    const seatMatch = text.match(/(?:seat|seats|person|people) for (\d+)/i);
    const priceMatch = text.match(/(?:₹|Rs\.?|INR)?\s?(\d{2,5})/i);
  
    if (!fromMatch || !toMatch || !seatMatch || !priceMatch) return null;
  
    return {
      from: fromMatch[1],
      to: toMatch[1],
      seats: parseInt(seatMatch[1]),
      price: parseInt(priceMatch[1]),
      messageText: text
    };
  }
  
  module.exports = { extractRideBookingDetails };
  
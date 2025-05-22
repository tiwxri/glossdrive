function isRideBookingIntent(text) {
    return /from .* to .*/i.test(text);
  }
  
  module.exports = { isRideBookingIntent };
  
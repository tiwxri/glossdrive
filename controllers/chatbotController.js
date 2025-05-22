const { handleRideBooking } = require('../features/rideBooking/controller');
const { isRideBookingIntent } = require('../features/rideBooking/routes');

async function handleIncomingMessage({ message, mediaUrl, from }) {
  if (isRideBookingIntent(message)) {
    return await handleRideBooking({ message, mediaUrl, from });
  }

  return { reply: "Sorry, I didn't understand that. Please mention where you're going and seat availability." };
}

module.exports = { handleIncomingMessage };

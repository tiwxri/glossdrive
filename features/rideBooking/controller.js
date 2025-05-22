// Ride booking controller
const parserService = require('../../services/parserService');
const transcribeService = require('../../services/transcribeService');
const firebaseService = require('../../services/firebaseService');

async function handleRideBooking({ message, mediaUrl, from }) {
  let textContent = message;

  if (mediaUrl) {
    try {
      textContent = await transcribeService.transcribeAudio(mediaUrl);
    } catch (err) {
      console.error('Failed to transcribe audio:', err);
      return { reply: "Sorry, I couldn't understand your audio message." };
    }
  }

  const parsedData = parserService.extractRideBookingDetails(textContent);
  if (!parsedData) {
    return { reply: "Please mention your route, seat availability and charge clearly." };
  }

  const lead = {
    ...parsedData,
    user: from,
    createdAt: new Date().toISOString(),
  };

  await firebaseService.saveRideLead(lead);
  return {
    reply: `Thanks! We've saved your ride from ${lead.from} to ${lead.to} charging ₹${lead.price}.`,
  };
}

module.exports = { handleRideBooking };

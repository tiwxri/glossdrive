// features/rideBooking/service.js
const admin = require('firebase-admin');
const db = admin.firestore();

async function saveRide(userId, rideDetails) {
  await db.collection('rides').add({
    userId,
    ...rideDetails,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });
}

async function findRides(origin, destination, seats) {
  const snapshot = await db.collection('rides')
    .where('origin', '==', origin)
    .where('destination', '==', destination)
    .where('seats', '>=', seats)
    .get();

  if (snapshot.empty) return [];

  return snapshot.docs.map(doc => doc.data());
}

module.exports = { saveRide, findRides };

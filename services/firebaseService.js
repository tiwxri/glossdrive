// const { db } = require('../firebase/firebaseConfig');

// exports.getSession = async (phone) => {
//   const doc = await db.collection('sessions').doc(phone).get();
//   return doc.exists ? doc.data() : {};
// };

// exports.updateSession = async (phone, session) => {
//   await db.collection('sessions').doc(phone).set(session);
// };
const admin = require('firebase-admin');
const db = admin.firestore();

async function saveRideLead(lead) {
  const leadsRef = db.collection('ride_leads');
  await leadsRef.add(lead);
}

module.exports = { saveRideLead };

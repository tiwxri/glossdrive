// const { db } = require('../firebase/firebaseConfig');

// exports.getSession = async (phone) => {
//   const doc = await db.collection('sessions').doc(phone).get();
//   return doc.exists ? doc.data() : {};
// };

// exports.updateSession = async (phone, session) => {
//   await db.collection('sessions').doc(phone).set(session);
// };

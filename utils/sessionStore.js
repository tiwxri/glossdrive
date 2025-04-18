const { db } = require('./firebase');// adjust path based on location

const collection = db.collection('sessions');

async function getSession(userId) {
  const doc = await collection.doc(userId).get();
  return doc.exists ? doc.data() : { step: 'chooseService' };
}

async function saveSession(userId, sessionData) {
  await collection.doc(userId).set(sessionData);
}

module.exports = {
  getSession,
  saveSession,
};

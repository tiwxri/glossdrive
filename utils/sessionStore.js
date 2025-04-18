const { db } = require('./firebase');// adjust path based on location

const collection = db.collection('sessions');

async function getSession(userId) {
  const doc = await collection.doc(userId).get();
  return doc.exists ? doc.data() : { step: 'chooseService' };
}

async function saveSession(userId, sessionData) {
    try {
        const plainData = JSON.parse(JSON.stringify(sessionData));
        await collection.doc(userId).set(plainData);
    } catch (error) {
        console.error('Failed to save session:', sessionData);
        throw error;
    }
}

module.exports = {
  getSession,
  saveSession,
};

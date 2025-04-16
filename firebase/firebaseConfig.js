const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json'); // from Firebase

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://glossdrivemvp.firebaseio.com'
});

const db = admin.firestore();
module.exports = { db };

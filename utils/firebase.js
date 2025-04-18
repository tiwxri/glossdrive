const admin = require('firebase-admin');
// Path to your service account JSON file
const serviceAccount = require('../serviceAccount.json'); // ✅ make sure this file exists

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

module.exports = { admin, db }; // ✅ Export both
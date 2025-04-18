const admin = require('firebase-admin');
// Path to your service account JSON file
const serviceAccount = JSON.parse(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT).replace(/\\n/g, '\n'));
 // ✅ make sure this file exists

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

module.exports = { admin, db }; // ✅ Export both
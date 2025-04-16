const admin = require('firebase-admin');
const serviceAccount = require('./config/glossdrivemvp-firebase-adminsdk-fbsvc-e7345fe6bf.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://glossdrivemvp-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.firestore(); // Or use .database() for Realtime DB

module.exports = db;

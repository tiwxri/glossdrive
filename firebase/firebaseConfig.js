const admin = require('firebase-admin');
const serviceAccount = require(path.resolve(__dirname, 'serviceAccount.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://glossdrivemvp.firebaseio.com'
});

const db = admin.firestore();
module.exports = { db };

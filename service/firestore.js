
const { GOOGLE_SCOPES, CREDENTIALS } = require('../common/constants/server.constant');
const { google } = require('googleapis');
const admin = require('firebase-admin');

const firestore = google.firestore('v1');
const auth = new google.auth.GoogleAuth({
  credentials: CREDENTIALS,
  scopes: GOOGLE_SCOPES
});

admin.initializeApp({
  credential: admin.credential.cert(CREDENTIALS)
});

// (async _=> {
//   const authClient = await auth.getClient();
//   PROJECT_ID = await auth.getProjectId();
// })()


exports.RestDocRef = firestore.projects.databases.documents;
exports.RestDbRef = firestore.projects.databases;
exports.AdminDbRef = admin.firestore();
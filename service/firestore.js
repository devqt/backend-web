
const { GOOGLE_SCOPES, CREDENTIALS } = require('../common/server-constant');

const { google } = require('googleapis');
const firestore = google.firestore('v1');
const auth = new google.auth.GoogleAuth({
    credentials: CREDENTIALS,
    scopes: GOOGLE_SCOPES
  });
// (async _=> {
//   const authClient = await auth.getClient();
//   PROJECT_ID = await auth.getProjectId();
// })()


exports.docRef = firestore.projects.databases.documents;
exports.dbRef = firestore.projects.databases;

const serviceAccount = require('../common/angular-admin-1abb5-firebase-adminsdk-70n21-7f57f36c3f.json');
const { google } = require('googleapis');
const firestore = google.firestore('v1');
const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/datastore', 'https://www.googleapis.com/auth/cloud-platform']
  });
// (async _=> {
//   const authClient = await auth.getClient();
//   PROJECT_ID = await auth.getProjectId();
// })()


// (async _ => {
//   console.log(await firestore.projects.databases.documents.get({name: 'projects/angular-admin-1abb5/databases/(default)/documents/user/DEp0FysC3W7UkeFMbC8y'}));
// })().catch(console.error);

exports.PROJECT_ID = serviceAccount['project_id'];
exports.docRef = firestore.projects.databases.documents;
exports.dbRef = firestore.projects.databases;
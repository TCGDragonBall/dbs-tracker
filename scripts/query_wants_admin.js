import admin from 'firebase-admin';
import fs from 'fs';

try {
  admin.initializeApp();
} catch(e) {}

const db = admin.firestore();

async function checkWants() {
  try {
    // The previous error was: Cloud Firestore API has not been used in project...
    // Oh, the environment variable GOOGLE_APPLICATION_CREDENTIALS might be pointing to a default service account
    // that doesn't have the API enabled for its project, OR the user's project is different.
    // The user's project ID is ais-europe-west2-6285fbe237164 but the actual project in firebase-applet-config.json might be different!
    const rawConfig = fs.readFileSync('firebase-applet-config.json');
    const config = JSON.parse(rawConfig);
    console.log("Firebase config project ID:", config.projectId);
    
    // So the Firebase setup uses the config. We can try initializing the client SDK to read documents 
    // IF the rules allowed it, but the rules restrict `users` to `isVerifiedUser() || isAdmin()`.
  } catch(e) {
    console.error(e);
  }
}
checkWants();

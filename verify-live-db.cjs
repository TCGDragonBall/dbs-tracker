const admin = require('firebase-admin');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken } = require('firebase/auth');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const fs = require('fs');

admin.initializeApp();

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json'));
const app = initializeApp(firebaseConfig);
const clientAuth = getAuth(app);
const clientDb = getFirestore(app);

async function runTest() {
  try {
    const uid = "test_user_uid_123";
    console.log("Minting token for UID:", uid);
    const customToken = await admin.auth().createCustomToken(uid);
    
    console.log("Signing in client SDK...");
    const userCredential = await signInWithCustomToken(clientAuth, customToken);
    console.log("Signed in. Attempting Firestore read...");
    
    const docRef = doc(clientDb, 'users', uid, 'career', 'data');
    const snap = await getDoc(docRef);
    console.log("SUCCESS! Document exists:", snap.exists());
  } catch (err) {
    console.error("TEST FAILED:", err.message);
  }
  process.exit(0);
}
runTest();

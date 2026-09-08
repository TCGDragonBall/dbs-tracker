const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function test() {
  try {
    const cred = await signInAnonymously(auth);
    console.log("Signed in anonymously as", cred.user.uid);
    const docRef = doc(db, 'users', cred.user.uid, 'career', 'data');
    const snap = await getDoc(docRef);
    console.log("Success reading career data", snap.exists());
  } catch (e) {
    console.error("Test failed", e);
  }
  process.exit(0);
}
test();

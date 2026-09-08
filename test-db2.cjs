const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    const docRef = doc(db, 'users', 'dummy', 'career', 'data');
    const snap = await getDoc(docRef);
    console.log("Success reading career data", snap.exists());
  } catch (e) {
    console.error("Test failed", e);
  }
  process.exit(0);
}
test();

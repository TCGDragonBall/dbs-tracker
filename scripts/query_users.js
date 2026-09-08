import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';

const rawConfig = fs.readFileSync('firebase-applet-config.json');
const config = JSON.parse(rawConfig);

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function checkLists() {
  try {
    try {
      await signInAnonymously(auth);
    } catch(e) {
      console.log('Anonymous auth not enabled');
    }

    const listsCol = collection(db, 'lists');
    const snapshot = await getDocs(listsCol);
    
    console.log(`Total Wants Lists found: ${snapshot.docs.length}`);
    process.exit(0);
  } catch (err) {
    console.error('Error querying lists:', err);
    process.exit(1);
  }
}

checkLists();

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "pruebas-texelman-1531156071599",
  "appId": "1:584747168513:web:8c55a6e680e82c71bee100",
  "apiKey": "AIzaSyBdvuPeYr3qya8-SXGPl3ZcsGnpN6DtM0g",
  "authDomain": "pruebas-texelman-1531156-65617.firebaseapp.com",
  "firestoreDatabaseId": "(default)",
  "storageBucket": "pruebas-texelman-1531156071599.firebasestorage.app",
  "messagingSenderId": "584747168513",
  "measurementId": ""
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dummyUsers = [
  { id: 'dummy_user_1', displayName: 'Goku (Bot)', email: 'goku@bot.com' },
  { id: 'dummy_user_2', displayName: 'Vegeta (Bot)', email: 'vegeta@bot.com' },
  { id: 'dummy_user_3', displayName: 'Piccolo (Bot)', email: 'piccolo@bot.com' },
  { id: 'dummy_user_4', displayName: 'Krillin (Bot)', email: 'krillin@bot.com' },
  { id: 'dummy_user_5', displayName: 'Gohan (Bot)', email: 'gohan@bot.com' },
  { id: 'dummy_user_6', displayName: 'Trunks (Bot)', email: 'trunks@bot.com' },
  { id: 'dummy_user_7', displayName: 'Frieza (Bot)', email: 'frieza@bot.com' }
];

async function seed() {
  for (const user of dummyUsers) {
    await setDoc(doc(db, 'users', user.id), {
      displayName: user.displayName,
      email: user.email,
      createdAt: new Date().toISOString()
    });
    console.log(`Created ${user.displayName}`);
  }
  console.log('Done!');
  process.exit(0);
}

seed().catch(console.error);

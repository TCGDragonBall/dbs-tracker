import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';

const rawConfig = fs.readFileSync('firebase-applet-config.json');
const config = JSON.parse(rawConfig);

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function checkLists() {
  try {
    const listsCol = collection(db, 'lists');
    const snapshot = await getDocs(listsCol);
    
    let totalLists = 0;
    let totalCards = 0;
    let cardsFreq = {};

    for (const doc of snapshot.docs) {
      totalLists++;
      const data = doc.data();
      const cards = data.cards || [];
      totalCards += cards.length;
      for (const card of cards) {
        cardsFreq[card] = (cardsFreq[card] || 0) + 1;
      }
    }

    console.log('--- WANTS LISTS STATISTICS ---');
    console.log(`Total Wants Lists found: ${totalLists}`);
    console.log(`Total cards saved across all lists: ${totalCards}`);
    
    if (totalLists > 0) {
      console.log('\nTop 10 Most Wanted Cards in Lists:');
      const sortedWants = Object.entries(cardsFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      for (const [cardId, count] of sortedWants) {
        console.log(`- ${cardId}: wanted in ${count} lists`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error querying lists:', err);
    process.exit(1);
  }
}

checkLists();

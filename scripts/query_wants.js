import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

// Read config from firebase-applet-config.json
const rawConfig = fs.readFileSync('firebase-applet-config.json');
const config = JSON.parse(rawConfig);

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function checkWants() {
  try {
    const usersCol = collection(db, 'users');
    const userSnapshot = await getDocs(usersCol);
    
    let totalUsers = 0;
    let usersWithWants = 0;
    let totalWants = 0;
    let wantsByCard = {};

    for (const userDoc of userSnapshot.docs) {
      totalUsers++;
      const data = userDoc.data();
      const wants = data.wants || [];
      
      if (wants.length > 0) {
        usersWithWants++;
        totalWants += wants.length;
        
        for (const wantId of wants) {
          wantsByCard[wantId] = (wantsByCard[wantId] || 0) + 1;
        }
      }
    }

    console.log('--- WANTS LIST STATISTICS ---');
    console.log(`Total Users scanned: ${totalUsers}`);
    console.log(`Users utilizing Wants List: ${usersWithWants} (${((usersWithWants/totalUsers)*100).toFixed(1)}%)`);
    console.log(`Total cards wanted across all users: ${totalWants}`);
    
    if (totalWants > 0) {
      console.log('\nTop 10 Most Wanted Cards:');
      const sortedWants = Object.entries(wantsByCard)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
      
      for (const [cardId, count] of sortedWants) {
        console.log(`- ${cardId}: wanted by ${count} users`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error querying database:', err);
    process.exit(1);
  }
}

checkWants();

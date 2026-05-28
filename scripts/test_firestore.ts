import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

async function run() {
  try {
    // We can initialize firebase-admin using application default credentials, which works silently on Cloud Run!
    initializeApp({
      projectId: 'pruebas-texelman-1531156071599'
    });
    const db = getFirestore();
    console.log("Firebase initialized successfully on Cloud Run!");

    // Query the users collection to find the user with email/uid
    const usersSnap = await db.collection('users').get();
    console.log(`Total users found: ${usersSnap.size}`);
    
    let targetUid = null;
    usersSnap.forEach(doc => {
      const data = doc.data();
      console.log(`User: ${doc.id} | Email: ${data.email} | Name: ${data.displayName} | Unique: ${data.uniqueCards} | Total: ${data.totalCards}`);
      if (data.email === 'anulix1983@gmail.com') {
        targetUid = doc.id;
      }
    });

    if (!targetUid) {
      console.log("User anulix1983@gmail.com not found in users collection.");
      return;
    }

    console.log(`\nQuerying inventory for uid: ${targetUid}`);
    const invSnap = await db.collection('inventory').where('ownerId', '==', targetUid).get();
    console.log(`Inventory documents count: ${invSnap.size}`);
    
    const inventoryItems = [];
    invSnap.forEach(doc => {
      inventoryItems.push({ id: doc.id, ...doc.data() });
    });

    console.log("\nItems with quantity > 0:");
    const activeItems = inventoryItems.filter(i => i.quantity > 0);
    activeItems.forEach(i => {
      console.log(`- Card: ${i.cardId} | Qty: ${i.quantity}`);
    });

    console.log(`\nSummary: Active Unique Items Count = ${activeItems.length}`);
    const sumQty = activeItems.reduce((acc, i) => acc + i.quantity, 0);
    console.log(`Summary: Active Total Quantity Sum = ${sumQty}`);

  } catch (error) {
    console.error("Error executing database query:", error);
  }
}

run();

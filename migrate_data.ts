
// ============================================
// SCRIPT DE MIGRACIÓN DE DATOS (FIREBASE)
// ============================================
// Para ejecutar este script, primero debes habilitar 
// temporalmente la escritura en tu base de datos (default).
// 
// 1. Ve a la consola de Firebase: https://console.firebase.google.com/
// 2. Abre Firestore Database y selecciona la base de datos "(default)".
// 3. Ve a la pestaña "Reglas" (Rules).
// 4. Cambia las reglas provisionalmente a:
//    match /{document=**} {
//      allow read, write: if true;
//    }
// 5. Dale a "Publicar" (Publish).
// 6. Vuelve a AI Studio (aquí) y ejecuta en la terminal local:
//    npx tsx migrate_data.ts
// 7. Cuando termine, vuelve a la consola y restaura las reglas originales
//    (puedes copiar el contenido de "firestore.rules" de este proyecto).

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import fs from 'fs';

function chunkArray(myArray: any[], chunk_size: number) {
    let index = 0;
    let arrayLength = myArray.length;
    let tempArray = [];
    
    for (index = 0; index < arrayLength; index += chunk_size) {
        let chunk = myArray.slice(index, index+chunk_size);
        tempArray.push(chunk);
    }
    return tempArray;
}

async function migrate() {
  const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
  
  // Base de datos origen (la creada inicialmente)
  const sourceDbId = 'ai-studio-c028ef7f-01d4-4bd5-b924-e73348fc9d6f';
  const sourceApp = initializeApp(config, 'source-app');
  const sourceDb = getFirestore(sourceApp, sourceDbId);

  // Base de datos de destino (default)
  const targetApp = initializeApp(config, 'target-app');
  const targetDb = getFirestore(targetApp);

  const collections = ['users', 'inventory', 'achievements'];

  console.log(`Iniciando migración de ${sourceDbId} a (default)...`);

  for (const collName of collections) {
    console.log(`\nMigrando colección: ${collName}...`);
    try {
      const snap = await getDocs(collection(sourceDb, collName));
      console.log(`↳ Encontrados ${snap.size} documentos en origen.`);
      
      const chunks = chunkArray(snap.docs, 400);
      let i = 1;
      for (const chunk of chunks) {
         const batch = writeBatch(targetDb);
         for (const document of chunk) {
           const targetRef = doc(targetDb, collName, document.id);
           batch.set(targetRef, document.data());
         }
         await batch.commit();
         console.log(`  - Lote ${i++}/${chunks.length} importado en (default).`);
      }

      console.log(`✓ Colección ${collName} migrada con éxito.`);
    } catch (err: any) {
      console.error(`✕ Error migrando ${collName}: ${err.message}`);
      if (err.message.includes('Missing or insufficient permissions')) {
        console.error('\n--> ¡PERMISOS INSUFICIENTES! Confirma que has puesto "allow read, write: if true;" en tu base de datos (default) desde la Consola de Firebase.');
        return;
      }
      if (err.message.includes('Quota exceeded')) {
        console.error('\n--> DETENIDO: La base de datos de origen sigue sin cuota para leer. Inténtalo mañana.');
        return;
      }
    }
  }
  console.log('\n¡Migración finalizada!');
}

migrate().catch(console.error);



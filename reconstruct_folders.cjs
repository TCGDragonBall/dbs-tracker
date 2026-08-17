const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

let keys = [];
let lines = content.split('\n');
for (let line of lines) {
  let m = line.match(/^\s*'MASTERS_SEALED_([^']+)': \['SEALED_/);
  if (m) {
     keys.push(m[1]);
  }
}

let tpFolder = [];
let epFolder = [];
let champFolder = [];

for (let key of keys) {
  if (key.includes('TP_FOLDER') || key.includes('EP_FOLDER') || key.includes('CHAMPIONSHIP_FOLDER')) continue;
  if (key.includes('EP') && !key.includes('CELEBRATION')) {
     epFolder.push(`'SEALED_${key}'`);
  } else if (key.includes('CHAMPIONSHIP') || key.includes('PACS')) {
     champFolder.push(`'SEALED_${key}'`);
  } else {
     // Put in TP_FOLDER by default since it contains almost everything else (PB, TP, UW, ZENKAI, DELUXE, etc).
     // Wait, is PB in TP_FOLDER? Let's check PB01
     tpFolder.push(`'SEALED_${key}'`);
  }
}

console.log('EP:', epFolder.length, epFolder);
console.log('CHAMP:', champFolder.length, champFolder);
// console.log('TP:', tpFolder.length, tpFolder);

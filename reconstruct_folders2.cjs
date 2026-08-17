const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

let keysAndValues = [];
let lines = content.split('\n');
for (let line of lines) {
  let m = line.match(/^\s*'MASTERS_SEALED_([^']+)': \['([^']+)'\]/);
  if (m) {
     keysAndValues.push({key: m[1], val: m[2]});
  }
}

let tpFolder = [];
let epFolder = [];
let champFolder = [];
let pbFolder = [];

for (let kv of keysAndValues) {
  if (kv.key.includes('TP_FOLDER') || kv.key.includes('EP_FOLDER') || kv.key.includes('CHAMPIONSHIP_FOLDER') || kv.key.includes('PB_FOLDER')) continue;
  
  if (kv.key.includes('EP') && !kv.key.includes('CELEBRATION')) {
     epFolder.push(`'${kv.val}'`);
  } else if (kv.key.includes('CHAMPIONSHIP') || kv.key.includes('PACS')) {
     champFolder.push(`'${kv.val}'`);
  } else if (kv.key.includes('PB')) {
     pbFolder.push(`'${kv.val}'`);
  } else if (kv.key !== 'SPECIAL_TOKEN_PACK') {
     tpFolder.push(`'${kv.val}'`);
  }
}

console.log(`
  'MASTERS_SEALED_TP_FOLDER': [
    ${tpFolder.join(', ')}
  ],
  'MASTERS_SEALED_EP_FOLDER': [
    ${epFolder.join(', ')}
  ],
  'MASTERS_SEALED_CHAMPIONSHIP_FOLDER': [
    ${champFolder.join(', ')}
  ],
  'MASTERS_SEALED_PB_FOLDER': [
    ${pbFolder.join(', ')}
  ],
`);

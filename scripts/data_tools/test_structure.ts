import * as fs from 'fs';

const bt2 = fs.readFileSync('src/data/bt2.ts', 'utf8');
const lines = bt2.split('\n');
const cellLeader = lines.find(l => l.startsWith('BT2-068'));
if (cellLeader) {
  const parts = cellLeader.split('\t');
  console.log('Total parts:', parts.length);
  parts.forEach((p, i) => {
    console.log(`${i}: ${p}`);
  });
} else {
  console.log('Cell leader not found in bt2Data');
}

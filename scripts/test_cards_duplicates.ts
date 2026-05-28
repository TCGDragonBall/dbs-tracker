import { bt1Data } from '../src/data/bt1';
import { promoData } from '../src/data/promos';
import { startersData } from '../src/data/starters';
import { expertsData } from '../src/data/experts';
import { expansionsData } from '../src/data/expansions';
import { tb3Data } from '../src/data/tb3';
import { tb2Data } from '../src/data/tb2';
import { tb1Data } from '../src/data/tb1';
import { eb1Data } from '../src/data/eb1';
import { db3Data } from '../src/data/db3';
import { db2Data } from '../src/data/db2';
import { db1Data } from '../src/data/db1';
import { bt2Data } from '../src/data/bt2';
import { bt3Data } from '../src/data/bt3';
import { bt4Data } from '../src/data/bt4';
import { bt5Data } from '../src/data/bt5';
import { bt6Data } from '../src/data/bt6';
import { bt7Data } from '../src/data/bt7';
import { bt8Data } from '../src/data/bt8';
import { bt9Data } from '../src/data/bt9';
import { bt10Data } from '../src/data/bt10';
import { bt11Data } from '../src/data/bt11';
import { bt12Data } from '../src/data/bt12';
import { bt13Data } from '../src/data/bt13';
import { bt14Data } from '../src/data/bt14';
import { bt15Data } from '../src/data/bt15';
import { bt16Data } from '../src/data/bt16';
import { bt17Data } from '../src/data/bt17';
import { bt18Data } from '../src/data/bt18';
import { bt19Data } from '../src/data/bt19';
import { bt20Data } from '../src/data/bt20';
import { bt21Data } from '../src/data/bt21';
import { bt22Data } from '../src/data/bt22';
import { bt23Data } from '../src/data/bt23';
import { bt24Data } from '../src/data/bt24';
import { bt25Data } from '../src/data/bt25';
import { bt26Data } from '../src/data/bt26';
import { bt27Data } from '../src/data/bt27';
import { bt28Data } from '../src/data/bt28';
import { bt29Data } from '../src/data/bt29';
import { bt30Data } from '../src/data/bt30';
import { energyMarkersData } from '../src/data/energy_markers';
import { tokensData } from '../src/data/tokens';
import { meritsData } from '../src/data/merits';

const mastersDataRaw = `${bt1Data}\n${promoData}\n${startersData}\n${expertsData}\n${expansionsData}\n${tb3Data}\n${tb2Data}\n${tb1Data}\n${eb1Data}\n${db3Data}\n${db2Data}\n${db1Data}\n${bt2Data}\n${bt3Data}\n${bt4Data}\n${bt5Data}\n${bt6Data}\n${bt7Data}\n${bt8Data}\n${bt9Data}\n${bt10Data}\n${bt11Data}\n${bt12Data}\n${bt13Data}\n${bt14Data}\n${bt15Data}\n${bt16Data}\n${bt17Data}\n${bt18Data}\n${bt19Data}\n${bt20Data}\n${bt21Data}\n${bt22Data}\n${bt23Data}\n${bt24Data}\n${bt25Data}\n${bt26Data}\n${bt27Data}\n${bt28Data}\n${bt29Data}\n${bt30Data}\n${energyMarkersData}\n${tokensData}\n${meritsData}`;

function check() {
  const lines = mastersDataRaw.split('\n').filter(l => l.trim());
  console.log(`Total parsed lines: ${lines.length}`);
  
  const idCounts = new Map<string, number>();
  const idLines = new Map<string, string[]>();
  
  lines.forEach((line) => {
    const parts = line.split('\t').map(s => s.trim());
    const cardId = parts[0];
    if (cardId) {
      idCounts.set(cardId, (idCounts.get(cardId) || 0) + 1);
      if (!idLines.has(cardId)) {
        idLines.set(cardId, []);
      }
      idLines.get(cardId)!.push(line);
    }
  });

  let duplicateCount = 0;
  idCounts.forEach((count, id) => {
    if (count > 1) {
      duplicateCount++;
      if (duplicateCount <= 10) {
        console.log(`Duplicate found for card ID: ${id} (${count} times)`);
        console.log("Lines:");
        idLines.get(id)!.forEach(l => console.log(`  - ${l}`));
      }
    }
  });

  console.log(`Total duplicate Card IDs: ${duplicateCount}`);
}

check();

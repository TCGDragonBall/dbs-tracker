import fs from 'fs';
import { bt1Data } from './src/data/bt1';
import { promoData } from './src/data/promos';
import { startersData } from './src/data/starters';
import { expertsData } from './src/data/experts';
import { expansionsData } from './src/data/expansions';
import { tb3Data } from './src/data/tb3';
import { meritsData } from './src/data/merits';
import { tokensData } from './src/data/tokens';
import { sleevesData } from './src/data/sleeves';
import { tb2Data } from './src/data/tb2';
import { tb1Data } from './src/data/tb1';
import { eb1Data } from './src/data/eb1';
import { db3Data } from './src/data/db3';
import { db2Data } from './src/data/db2';
import { db1Data } from './src/data/db1';
import { bt2Data } from './src/data/bt2';
import { bt3Data } from './src/data/bt3';
import { bt4Data } from './src/data/bt4';
import { bt5Data } from './src/data/bt5';
import { bt6Data } from './src/data/bt6';
import { bt7Data } from './src/data/bt7';
import { bt8Data } from './src/data/bt8';
import { bt9Data } from './src/data/bt9';
import { bt10Data } from './src/data/bt10';
import { bt11Data } from './src/data/bt11';
import { bt12Data } from './src/data/bt12';
import { bt13Data } from './src/data/bt13';
import { bt14Data } from './src/data/bt14';
import { bt15Data } from './src/data/bt15';
import { bt16Data } from './src/data/bt16';
import { bt17Data } from './src/data/bt17';
import { bt18Data } from './src/data/bt18';
import { bt19Data } from './src/data/bt19';
import { bt20Data } from './src/data/bt20';
import { bt21Data } from './src/data/bt21';
import { bt22Data } from './src/data/bt22';
import { bt23Data } from './src/data/bt23';
import { bt24Data } from './src/data/bt24';
import { bt25Data } from './src/data/bt25';
import { bt26Data } from './src/data/bt26';
import { bt27Data } from './src/data/bt27';
import { bt28Data } from './src/data/bt28';
import { bt29Data } from './src/data/bt29';
import { bt30Data } from './src/data/bt30';
import { bt31Data } from './src/data/bt31';
import { fusionWorldData } from './src/data/fusion_world';
import { sealedCardsData } from './src/data/sealed';
import { playmatsData } from './src/data/playmats';
import { casesData, separatorsData } from './src/data/accessories';
import { st01Data } from './src/data/st01';
import { energyMarkersData } from './src/data/energy_markers';

const mastersDataRaw = `${bt1Data}\n${promoData}\n${startersData}\n${expertsData}\n${expansionsData}\n${tb3Data}\n${tb2Data}\n${tb1Data}\n${eb1Data}\n${db3Data}\n${db2Data}\n${db1Data}\n${bt2Data}\n${bt3Data}\n${bt4Data}\n${bt5Data}\n${bt6Data}\n${bt7Data}\n${bt8Data}\n${bt9Data}\n${bt10Data}\n${bt11Data}\n${bt12Data}\n${bt13Data}\n${bt14Data}\n${bt15Data}\n${bt16Data}\n${bt17Data}\n${bt18Data}\n${bt19Data}\n${bt20Data}\n${bt21Data}\n${bt22Data}\n${bt23Data}\n${bt24Data}\n${bt25Data}\n${bt26Data}\n${bt27Data}\n${bt28Data}\n${bt29Data}\n${bt30Data}\n${bt31Data}\n${energyMarkersData}\n${tokensData}\n${meritsData}\n${sealedCardsData}\n${sleevesData}\n${playmatsData}\n${casesData}\n${separatorsData}`;
const combinedData = `${fusionWorldData}\n${st01Data}\n${mastersDataRaw}`;

let parsedCards = combinedData.split('\n').filter(line => line.trim()).map((line, i) => {
  const parts = line.split('\t').map(s => s?.trim() || '');
  
  let cardNumber = parts[0];
  let name = parts[1];
  let rarity = parts[2];
  let type = parts[3];
  let color = parts[4];
  let expansionId = parts[5];
  let power = parts[6];
  let energy = parts[7];
  let comboEnergy = parts[8];
  let comboPower = parts[9];
  let character = undefined;
  let specialTrait = undefined;
  let era = undefined;
  let skill = undefined;

  if (parts.length >= 14) {
    character = parts[10];
    specialTrait = parts[11];
    era = parts[12];
    skill = parts[13];
  } else {
    specialTrait = parts[10];
    era = parts[11];
    skill = parts[12];
  }

  let finalCode = cardNumber || '';
  let imageUrl = '';
  
  if (finalCode) {
    finalCode = finalCode.replace(/^EX([1-9])(-)/, 'EX0$1$2');
    finalCode = finalCode.replace(/^XD0([1-9])(-)/, 'XD$1$2');
    finalCode = finalCode.replace(/_TS$/, '_PR').replace(/_W$/, '_PR').replace(/_GS$/, '').replace(/_PB01_F$/, '').replace(/_PB01$/, '');
    
    // Simplistic image logic without overrides for now, just to see what happens
    imageUrl = `https://www.dbs-cardgame.com/images/cardlist/cardimg/${finalCode}.png`;
    // We should extract the actual image overrides
  }

  return {
    cardNumber: cardNumber || 'Unknown',
    name: name || 'Unknown Name',
    type: type || 'Battle',
    color: color || 'Red',
    power: power && power !== '-' ? parseInt(power.replace(/\D/g, '')) || 0 : 0,
    energyCost: energy && energy !== '-' ? parseInt(energy.split('(')[0]) || 0 : 0,
    comboPower: comboPower && comboPower !== '-' ? parseInt(comboPower) || 0 : 0,
    comboCost: comboEnergy && comboEnergy !== '-' ? parseInt(comboEnergy) || 0 : 0,
    character: character || '',
    specialTrait: specialTrait || '',
    era: era || '',
    skillText: skill || '',
    imageUrl: imageUrl
  };
});

fs.writeFileSync('public/dbs_cards_export.json', JSON.stringify(parsedCards, null, 2), 'utf-8');
console.log('Exported ' + parsedCards.length + ' cards to public/dbs_cards_export.json');

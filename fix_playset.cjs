const fs = require('fs');
const path = 'src/TrackerApp.tsx';
let content = fs.readFileSync(path, 'utf-8');

const tTarget = `const getTargetQuantity = (card: Card, goal: 'collector' | 'player') => {
  if (goal === 'collector') return 1;
  const isOneUnitOnly = 
    (card.type.includes('Leader') && !card.type.toLowerCase().includes('z-leader')) || 
    card.id.includes('_SLR') || 
    card.type.includes('Marker') || card.type.toLowerCase().includes('merit') || 
    ['SCR', 'GDR', 'LEADER RARE'].includes(card.rarity) ||
    /_CS[1-3]$/.test(card.id);
  return isOneUnitOnly ? 1 : 4;
};`;

const tRepl = `const getTargetQuantity = (card: Card, goal: 'collector' | 'player') => {
  if (goal === 'collector') return 1;
  const isOneUnitOnly = 
    (card.type.includes('Leader') && !card.type.toLowerCase().includes('z-leader')) || 
    card.id.includes('_SLR') || 
    card.type.includes('Marker') || card.type.toLowerCase().includes('merit') || 
    card.type.includes('Playmat') || 
    ['SCR', 'GDR', 'LEADER RARE'].includes(card.rarity) ||
    /_CS[1-3]$/.test(card.id);
  return isOneUnitOnly ? 1 : 4;
};`;

if (content.includes(tTarget)) {
  content = content.replace(tTarget, tRepl);
  fs.writeFileSync(path, content, 'utf-8');
  console.log('Fixed Playset to 1 for Playmats');
} else {
  console.log('Target not found for playset');
}

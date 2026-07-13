const fs = require('fs');

// Patch TrackerApp.tsx
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
const regex = /  'M-26_PR': 'https:\/\/scontent-bcn1-1\.xx\.fbcdn\.net[\s\S]*?'M-44_PR': 'https:\/\/tcgplayer-cdn\.tcgplayer\.com\/product\/588329_in_800x800\.jpg',/;

const replacement = `  'M-26_PR': '/images/m26g.jpg',
  'M-27': 'https://tcgplayer-cdn.tcgplayer.com/product/675290_in_800x800.jpg',
  'M-27_PR': '/images/m27g.jpg',
  'M-28': 'https://tcgplayer-cdn.tcgplayer.com/product/675292_in_800x800.jpg',
  'M-28_PR': '/images/m28g.jpg',
  'M-29': 'https://tcgplayer-cdn.tcgplayer.com/product/675289_in_800x800.jpg',
  'M-29_PR': '/images/m29-g.jpg',
  'M-30': 'https://tcgplayer-cdn.tcgplayer.com/product/675286_in_800x800.jpg',
  'M-30_PR': '/images/m30g.jpg',
  'M-31': 'https://tcgplayer-cdn.tcgplayer.com/product/675284_in_800x800.jpg',
  'M-31_PR': '/images/m31g.jpg',
  'M-32': 'https://tcgplayer-cdn.tcgplayer.com/product/675293_in_800x800.jpg',
  'M-32_PR': '/images/m32g.webp',
  'M-33': 'https://tcgplayer-cdn.tcgplayer.com/product/675294_in_800x800.jpg',
  'M-33_PR': '/images/m33g.jpg',
  'M-34': 'https://tcgplayer-cdn.tcgplayer.com/product/656436_in_800x800.jpg',
  'M-35': 'https://tcgplayer-cdn.tcgplayer.com/product/656437_in_800x800.jpg',
  'M-36': 'https://tcgplayer-cdn.tcgplayer.com/product/668716_in_800x800.jpg',
  'M-37': 'https://tcgplayer-cdn.tcgplayer.com/product/668717_in_800x800.jpg',
  'M-38': 'https://tcgplayer-cdn.tcgplayer.com/product/668728_in_800x800.jpg',
  'M-39': 'https://tcgplayer-cdn.tcgplayer.com/product/668729_in_800x800.jpg',
  'M-40': 'https://tcgplayer-cdn.tcgplayer.com/product/668730_in_800x800.jpg',
  'M-41': 'https://tcgplayer-cdn.tcgplayer.com/product/668732_in_800x800.jpg',
  'M-42': 'https://tcgplayer-cdn.tcgplayer.com/product/668733_in_800x800.jpg',
  'M-43': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3xdImjroZIkU4oQpzK1Se4wLAF7-Ugf71IQ&s',
  'M-44': 'https://static.fw.dbscards.fr/cards/common/back-energy.webp',`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
  console.log("TrackerApp patched successfully!");
} else {
  console.log("Regex not found in TrackerApp.");
}

// Patch energy_markers.ts
let emContent = fs.readFileSync('src/data/energy_markers.ts', 'utf8');
emContent = emContent.replace(/M-44_PR\tEnergy Marker M-44 Gold\tPR\tMarker\tMulti\tENM/, '');
fs.writeFileSync('src/data/energy_markers.ts', emContent, 'utf8');
console.log("energy_markers.ts patched successfully!");


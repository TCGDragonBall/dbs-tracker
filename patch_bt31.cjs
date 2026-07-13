const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const regex = /  'BT31-EM01_PR': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/588329_in_800x800.jpg',\n  'BT31-EM02': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/702617_in_1000x1000.jpg',\n  'BT31-EM02_PR': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/588329_in_800x800.jpg',\n  'BT31-EM03': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/702614_in_1000x1000.jpg',\n  'BT31-EM03_PR': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/588329_in_800x800.jpg',\n  'BT31-EM04': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/702619_in_1000x1000.jpg',\n  'BT31-EM04_PR': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/588329_in_800x800.jpg',\n  'BT31-EM05': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/702621_in_1000x1000.jpg',\n  'BT31-EM05_PR': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/588329_in_800x800.jpg',\n  'BT31-EM06': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/702620_in_1000x1000.jpg',\n  'BT31-EM06_PR': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/588329_in_800x800.jpg',/;

const replacement = `  'BT31-EM01_PR': 'https://static.fw.dbscards.fr/cards/common/back-energy.webp',
  'BT31-EM02': 'https://tcgplayer-cdn.tcgplayer.com/product/702617_in_1000x1000.jpg',
  'BT31-EM02_PR': 'https://static.fw.dbscards.fr/cards/common/back-energy.webp',
  'BT31-EM03': 'https://tcgplayer-cdn.tcgplayer.com/product/702614_in_1000x1000.jpg',
  'BT31-EM03_PR': 'https://static.fw.dbscards.fr/cards/common/back-energy.webp',
  'BT31-EM04': 'https://tcgplayer-cdn.tcgplayer.com/product/702619_in_1000x1000.jpg',
  'BT31-EM04_PR': 'https://static.fw.dbscards.fr/cards/common/back-energy.webp',
  'BT31-EM05': 'https://tcgplayer-cdn.tcgplayer.com/product/702621_in_1000x1000.jpg',
  'BT31-EM05_PR': 'https://static.fw.dbscards.fr/cards/common/back-energy.webp',
  'BT31-EM06': 'https://tcgplayer-cdn.tcgplayer.com/product/702620_in_1000x1000.jpg',
  'BT31-EM06_PR': 'https://static.fw.dbscards.fr/cards/common/back-energy.webp',`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
  console.log("Patched successfully.");
} else {
  console.log("Regex not found.");
}

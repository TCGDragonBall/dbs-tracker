const fs = require('fs');
let content = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const regex = /  'M-44': [\s\S]*?'BT31-EM06': 'https:\/\/tcgplayer-cdn.tcgplayer.com\/product\/702620_in_1000x1000.jpg',/;

const replacement = `  'M-44': 'https://tcgplayer-cdn.tcgplayer.com/product/675294_in_1000x1000.jpg',
  'M-44_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/588329_in_800x800.jpg',
  'M-45': 'https://tcgplayer-cdn.tcgplayer.com/product/689038_in_1000x1000.jpg',
  'M-45_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/689039_in_1000x1000.jpg',
  'M-46': 'https://tcgplayer-cdn.tcgplayer.com/product/690692_in_1000x1000.jpg',
  'M-46_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/690693_in_1000x1000.jpg',
  'M-47': 'https://tcgplayer-cdn.tcgplayer.com/product/689040_in_1000x1000.jpg',
  'M-47_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/689041_in_1000x1000.jpg',
  'M-48': 'https://tcgplayer-cdn.tcgplayer.com/product/689071_in_1000x1000.jpg',
  'M-48_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/689072_in_1000x1000.jpg',
  'M-49': 'https://tcgplayer-cdn.tcgplayer.com/product/689042_in_1000x1000.jpg',
  'M-49_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/689043_in_1000x1000.jpg',
  'M-50': 'https://tcgplayer-cdn.tcgplayer.com/product/689067_in_1000x1000.jpg',
  'M-50_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/689068_in_1000x1000.jpg',
  'M-51': 'https://tcgplayer-cdn.tcgplayer.com/product/689069_in_1000x1000.jpg',
  'M-51_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/689070_in_1000x1000.jpg',
  'M-52': 'https://tcgplayer-cdn.tcgplayer.com/product/689044_in_1000x1000.jpg',
  'M-52_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/689045_in_1000x1000.jpg',
  'M-53': 'https://tcgplayer-cdn.tcgplayer.com/product/689063_in_1000x1000.jpg',
  'M-53_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/689064_in_1000x1000.jpg',
  'M-54': 'https://tcgplayer-cdn.tcgplayer.com/product/689065_in_1000x1000.jpg',
  'M-54_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/689066_in_1000x1000.jpg',
  'BT31-EM01': 'https://tcgplayer-cdn.tcgplayer.com/product/702625_in_1000x1000.jpg',
  'BT31-EM01_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/588329_in_800x800.jpg',
  'BT31-EM02': 'https://tcgplayer-cdn.tcgplayer.com/product/702617_in_1000x1000.jpg',
  'BT31-EM02_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/588329_in_800x800.jpg',
  'BT31-EM03': 'https://tcgplayer-cdn.tcgplayer.com/product/702614_in_1000x1000.jpg',
  'BT31-EM03_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/588329_in_800x800.jpg',
  'BT31-EM04': 'https://tcgplayer-cdn.tcgplayer.com/product/702619_in_1000x1000.jpg',
  'BT31-EM04_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/588329_in_800x800.jpg',
  'BT31-EM05': 'https://tcgplayer-cdn.tcgplayer.com/product/702621_in_1000x1000.jpg',
  'BT31-EM05_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/588329_in_800x800.jpg',
  'BT31-EM06': 'https://tcgplayer-cdn.tcgplayer.com/product/702620_in_1000x1000.jpg',
  'BT31-EM06_PR': 'https://tcgplayer-cdn.tcgplayer.com/product/588329_in_800x800.jpg',`;

if(regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/TrackerApp.tsx', content, 'utf8');
  console.log("Replaced successfully!");
} else {
  console.log("Could not find block to replace.");
}

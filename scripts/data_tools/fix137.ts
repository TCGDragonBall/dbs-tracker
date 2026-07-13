import * as fs from 'fs';

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');
appTsx = appTsx.replace(/'BT13-137_EP': \{ sourceProduct: 'Event Pack 09' \}/g, "'BT13-137_PR03': { sourceProduct: 'Event Pack 09' }");
appTsx = appTsx.replace(/'BT13-137_EP': \{ sourceProduct: 'Event Pack 16' \}/g, "'BT13-137_PR': { sourceProduct: 'Event Pack 16' }");
appTsx = appTsx.replace(/'BT13-137_EP': 'https:\/\/tcgplayer-cdn/g, "'BT13-137_PR': 'https://tcgplayer-cdn");
appTsx = appTsx.replace(/'BT13-137_EP': 'https:\/\/static.dbscards.fr\/cards\/en\/evp09/g, "'BT13-137_PR03': 'https://static.dbscards.fr/cards/en/evp09");

appTsx = appTsx.replace(/(const EVENT_PACK_09 = \[[^\]]*?)'BT13-137_EP'/g, "$1'BT13-137_PR03'");
appTsx = appTsx.replace(/(const EVENT_PACK_16 = \[[^\]]*?)'BT13-137_EP'/g, "$1'BT13-137_PR'");

fs.writeFileSync('src/App.tsx', appTsx, 'utf8');

let bt13 = fs.readFileSync('src/data/bt13.ts', 'utf8');
const lines = bt13.split('\n');
lines[163] = lines[163].replace('BT13-137_EP', 'BT13-137_PR03');
lines[165] = lines[165].replace('BT13-137_EP', 'BT13-137_PR');
fs.writeFileSync('src/data/bt13.ts', lines.join('\n'), 'utf8');

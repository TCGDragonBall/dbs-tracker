const fs = require('fs');

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// 1. Add PROMO_METADATA
const promoMetadata = `
  'P-757': { sourceProduct: 'Deluxe Pack 2026 Vol.2' },
  'P-758': { sourceProduct: 'Deluxe Pack 2026 Vol.2' },
  'P-759': { sourceProduct: 'Deluxe Pack 2026 Vol.2' },
  'P-760': { sourceProduct: 'Deluxe Pack 2026 Vol.2' },
  'P-761': { sourceProduct: 'Deluxe Pack 2026 Vol.2' },
  'P-761_PR': { sourceProduct: 'Deluxe Pack 2026 Vol.2' },
  'P-762': { sourceProduct: 'Deluxe Pack 2026 Vol.2' },
  'P-762_PR': { sourceProduct: 'Deluxe Pack 2026 Vol.2' },
`;

if (!app.includes("'P-757': { sourceProduct")) {
  app = app.replace(
    /'P-754_W': \{ sourceProduct: 'Ultra-bout Series TOURNAMENT PACK VOL.3' \},/g,
    "$&" + promoMetadata
  );
}

// 2. Add imagesMap for cards
const imagesData = `
  'P-757': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-757.png',
  'P-758': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-758.png',
  'P-759': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-759.png',
  'P-760': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-760.png',
  'P-761': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-761.png',
  'P-761_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-761_PR.png',
  'P-762': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-762.png',
  'P-762_PR': 'https://www.dbs-cardgame.com/images/cardlist/cardimg/P-762_PR.png',
`;

if (!app.includes("'P-757': 'https://www.dbs-cardgame.com")) {
  app = app.replace(
    /'P-754_W': 'https:\/\/www.dbs-cardgame.com\/images\/cardlist\/cardimg\/P-754_PR.png',/g,
    "$&" + imagesData
  );
}

// 3. Add to arrays
const arrayStr = `
  'MASTERS_DELUXE_PACK_2026_V2': ['SEALED_DELUXE_PACK_2026_V2', 'P-757', 'P-758', 'P-759', 'P-760', 'P-761', 'P-761_PR', 'P-762', 'P-762_PR'],
`;
if (!app.includes("'MASTERS_DELUXE_PACK_2026_V2': ['SEALED")) {
  app = app.replace(
    /'MASTERS_DELUXE_PACK_2026_V1': \['SEALED_DELUXE_PACK_2026_V1', 'P-717', 'P-718', 'P-719', 'P-720', 'P-721', 'P-722'\],/g,
    "$&" + arrayStr
  );
}

// 4. Update categories subItems array for PROMOS
const catStr = `          { id: 'MASTERS_SEALED_DELUXE_PACK_2026_V2', label: 'Deluxe Pack 2026 Vol. 2', sub: 'Promo' },
`;
if (!app.includes("id: 'MASTERS_SEALED_DELUXE_PACK_2026_V2'")) {
  app = app.replace(
    /\{ id: 'MASTERS_SEALED_DELUXE_PACK_2026_V1', label: 'Deluxe Pack 2026 Vol. 1', sub: 'Promo' \},/g,
    "$& \n" + catStr
  );
}

// 5. Update MASTERS_SEALED_PROMOS array
if (!app.includes("'SEALED_DELUXE_PACK_2026_V2'")) {
  app = app.replace(
    /'SEALED_DELUXE_PACK_2026_V1',/g,
    "$& 'SEALED_DELUXE_PACK_2026_V2',"
  );
}

// 6. Update targetExpansion block
const expansionBlock = `
                            } else if (selectedCard.id === 'SEALED_DELUXE_PACK_2026_V2') {
                              targetExpansion = 'MASTERS_DELUXE_PACK_2026_V2';
`;
if (!app.includes("selectedCard.id === 'SEALED_DELUXE_PACK_2026_V2'")) {
  app = app.replace(
    /\} else if \(selectedCard\.id === 'SEALED_DELUXE_PACK_2026_V1'\) \{\n\s*targetExpansion = 'MASTERS_DELUXE_PACK_2026_V1';/g,
    "$&" + expansionBlock
  );
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('TrackerApp updated successfully!');

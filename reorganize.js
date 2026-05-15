import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Update FUSION_CATEGORIES
content = content.replace(
  /{ \s*id: 'tournament-packs',[\s\S]*?categories: \['Tournament Packs'\] \s*},/g,
  `{ \n    id: 'store-events', \n    label: { es: 'Store Events', en: 'Store Events' }, \n    icon: 'Store',\n    categories: ['Store Events'] \n  },`
);

content = content.replace(
  /{ \s*id: 'championship-2024',[\s\S]*?categories: \['Championship 2024'\] \s*},/g,
  `{ \n    id: 'championship', \n    label: { es: 'Championship', en: 'Championship' }, \n    icon: 'Trophy',\n    categories: ['Championship'] \n  },`
);

content = content.replace(
  /{ \s*id: 'sleeves',[\s\S]*?categories: \['Accessories Set'\],\s*locked: false\s*},/g,
  `{ \n    id: 'coleccionismo', \n    label: { es: 'Coleccionismo', en: 'Collectibles' }, \n    icon: 'Diamond',\n    categories: ['Coleccionismo'],\n    locked: false\n  },`
);

// Update FUSION_EXPANSION_GROUPS
// Merge Tournament Packs and Ultimate Battle
content = content.replace(
  /category: 'Tournament Packs',\s*items: \[([\s\S]*?)\]\s*},\s*{\s*category: 'Championship 2024',/g,
  `category: 'Store Events',\n    items: [$1` + 
  `      // Ultimate Battle merged here\n` +
  `      {\n        id: 'UB_2024_FOLDER',\n        label: 'Ultimate Battle 2024',\n        sub: 'Ultimate Battle',\n        subItems: [\n          { id: 'UB24-1', label: 'Ultimate Battle 2024 VOL 1', sub: 'Vol.1' },\n          { id: 'UB24-2', label: 'Ultimate Battle 2024 VOL 2', sub: 'Vol.2' }\n        ]\n      },\n      { id: 'BCG_FEST_24', label: 'Bandai Card Games Fest 24', sub: 'Eventos' },\n      {\n        id: 'UB_2025_FOLDER',\n        label: 'Ultimate Battle 2025 (Próximamente)',\n        sub: 'Ultimate Battle',\n        locked: true\n      },\n      {\n        id: 'UB_2026_FOLDER',\n        label: 'Ultimate Battle 2026 (Próximamente)',\n        sub: 'Ultimate Battle',\n        locked: true\n      }\n    ]\n  },\n  {\n    category: 'Championship',`
);

content = content.replace(
  /{\s*category: 'Ultimate Battle',[\s\S]*?\]\s*},/g,
  '' // Already moved to Store Events
);

// Group Anniversary etc under Coleccionismo
content = content.replace(
  /{\s*category: 'Anniversary Set',[\s\S]*?category: 'Serial Cards',[\s\S]*?\]\s*}/g,
  `{
    category: 'Coleccionismo',
    items: [
      { id: 'AS2025', label: '1st Anniversary Set', sub: 'Premium' },
      {
        id: 'SL_CH2024_FOLDER',
        label: 'Championship 2024',
        sub: 'Eventos',
        locked: false,
        subItems: [
          { id: 'SL-CH-W1', label: 'Championship 2024 Wave 1', sub: 'Eventos', locked: false },
          { id: 'SL-CH-W2', label: 'Championship 2024 Wave 2', sub: 'Eventos', locked: false }
        ]
      },
      { id: 'SL01', label: 'OFFICIAL CARD SLEEVES 01', sub: 'Accessories', locked: false },
      { id: 'SL02', label: 'OFFICIAL CARD SLEEVES 02', sub: 'Accessories', locked: false },
      { id: 'SL03', label: 'OFFICIAL CARD SLEEVES 03', sub: 'Accessories', locked: false },
      { id: 'SL04', label: 'OFFICIAL CARD SLEEVES 04', sub: 'Accessories', locked: false },
      { id: 'SL-ILL', label: 'OFFICIAL CARD SLEEVES -ILLUSTRATIONS-', sub: 'Accessories', locked: false },
      { id: 'SL-ILL-SP', label: 'OFFICIAL CARD SLEEVES -ILLUSTRATIONS- Special', sub: 'Accessories', locked: false },
      { id: 'SL-LTD02-GOKU', label: 'Official Card Sleeves Limited Edition 02 - Son Goku Gold', sub: 'Accessories', locked: false },
      { id: 'SL-LTD02-SHENRON', label: 'Official Card Sleeves Limited Edition 02 - Shenron', sub: 'Accessories', locked: false },
      { id: 'SL-LTD03-BULMA', label: 'Official Card Sleeves Limited Edition 03 - Bulma', sub: 'Accessories', locked: false },
      { id: 'SL-LTD04-GOKU', label: 'Official Card Sleeves Limited Edition 04 - Son Goku', sub: 'Accessories', locked: false },
      {
        id: 'PM_CH2024_FOLDER',
        label: 'Championship 2024',
        sub: 'Eventos',
        locked: false,
        subItems: [
          { id: 'PM-CH-FINALS24', label: 'Finals 2024 Playmat', sub: 'Eventos', locked: false },
          { id: 'PM-CH-GF24', label: 'Grand Finals 2024 Playmat', sub: 'Eventos', locked: false },
          { id: 'PM-CH-W1', label: 'Championship 2024 Wave 1', sub: 'Eventos', locked: false },
          { id: 'PM-CH-W2', label: 'Championship 2024 Wave 2', sub: 'Eventos', locked: false }
        ]
      },
      { id: 'PM01', label: 'OFFICIAL PLAYMAT & CARD SET Limited Edition 01', sub: 'Accessories', locked: false },
      { id: 'PM02', label: 'Official Playmat 40th Anniversary ver.', sub: 'Accessories', locked: false },
      { id: 'PCC01', label: 'Premium Card Collection Vol.1', sub: 'Premium', locked: false, subItems: [
        { id: 'FS01-01_P1', label: 'Son Goku', sub: 'Leader' },
        { id: 'FS02-01_P1', label: 'Vegeta', sub: 'Leader' },
        { id: 'FS03-01_P1', label: 'Broly', sub: 'Leader' },
        { id: 'FS04-01_P1', label: 'Frieza', sub: 'Leader' },
        { id: 'FS05-01_P1', label: 'Bardock', sub: 'Leader' }
      ] },
      { id: 'PCC02', label: 'Premium Card Collection Vol.2', sub: 'Premium', locked: false, subItems: [
        { id: 'FB02-119_P3', label: 'Son Goku', sub: 'Card' },
        { id: 'FB04-012_P3', label: 'Son Goku (Mini) : DA', sub: 'Card' },
        { id: 'FB06-036_P1', label: 'Vegeta (Mini) : DA', sub: 'Card' },
        { id: 'FB06-062_P1', label: 'Broly : BR', sub: 'Card' },
        { id: 'FB06-097_P3', label: 'Gogeta', sub: 'Card' }
      ] },
      { id: 'CC-BARDOCK', label: 'Official Card Case Sleeves Set 01 - Bardock', sub: 'Accessories', locked: false },
      { id: 'CC-VEGITO', label: 'Official Card Case Sleeves Set 02 - Vegito', sub: 'Accessories', locked: false },
      { id: 'CC-GOGETA', label: 'Official Card Case Sleeves Set 03 - Gogeta', sub: 'Accessories', locked: false },
      { id: 'CC-BROLY', label: 'Official Card Case Sleeves Set 04 - Broly', sub: 'Accessories', locked: false },
      { id: 'ACS01', label: 'OFFICIAL ACCESSORIES SET 01 - Son Goku vs Frieza', sub: 'Accessories', locked: false },
      { id: 'ACS02', label: 'OFFICIAL ACCESSORIES SET 02 - Vegito', sub: 'Accessories', locked: false },
      { id: 'SERIAL_W1', label: 'Serial Collection Wave 1', sub: 'Serial', locked: false },
    ]
  }`
);

// Level 1 logic
content = content.replace(
  /const isTournament = currentCollectionCategory === 'tournament-packs';[\s\S]*?const subcategories = isColeccionismo/g,
  `const isStoreEvents = currentCollectionCategory === 'store-events';\n                              const isChampionship = currentCollectionCategory === 'championship';\n                              const isColeccionismo = currentCollectionCategory === 'coleccionismo';\n                              \n                              const subcategories = isColeccionismo`
);

content = content.replace(
  /\? \(currentGroups\.find\(g => g\.category === 'Coleccionismo'\)\?\.items\.filter\(i => !i\.isSubItem\)\.map\(i => i\.label\) \|\| \[\]\) as string\[\][\s\S]*?: category\.categories;/g,
  `? (currentGroups.find(g => g.category === 'Coleccionismo')?.items.filter(i => !i.isSubItem).map(i => i.label) || []) as string[]
                                : isStoreEvents
                                ? (currentGroups.find(g => g.category === 'Store Events')?.items.map(i => i.label) || []) as string[]
                                : isChampionship
                                ? (currentGroups.find(g => g.category === 'Championship')?.items.map(i => i.label) || []) as string[]
                                : category.categories;`
);

content = content.replace(
  /const Icon = currentCollectionCategory === 'box'[\s\S]*?return \(/g,
  `const Icon = currentCollectionCategory === 'box' ? Package : 
                                          currentCollectionCategory === 'decks' ? Layers : 
                                          currentCollectionCategory === 'store-events' ? Store : 
                                          currentCollectionCategory === 'championship' ? Trophy : 
                                          currentCollectionCategory === 'coleccionismo' ? Diamond : Library;
                              
                              return (`
);

content = content.replace(
  /className={`grid \${\(isTournament \|\| isChampionship \|\| isPremium\) \? 'grid-cols-1' : 'grid-cols-2'} gap-4`}/g,
  'className={`grid ${(isStoreEvents || isChampionship || isColeccionismo) ? \'grid-cols-1\' : \'grid-cols-2\'} gap-4`}'
);

content = content.replace(
  /const expansionItem = isColeccionismo[\s\S]*?: null;/g,
  `const expansionItem = isColeccionismo 
                                     ? currentGroups.find(g => g.category === 'Coleccionismo')?.items.find(i => i.label === sub)
                                     : isStoreEvents 
                                     ? currentGroups.find(g => g.category === 'Store Events')?.items.find(i => i.label === sub)
                                     : isChampionship
                                     ? currentGroups.find(g => g.category === 'Championship')?.items.find(i => i.label === sub)
                                     : null;`
);

content = content.replace(
  /if \(isColeccionismo \|\| isTournament \|\| isChampionship \|\| isSerial \|\| isSleeves \|\| isPlaymats \|\| isPremium \|\| isUltimateBattle\) {/g,
  `if (isColeccionismo || isStoreEvents || isChampionship) {`
);

// Level 2 logic
content = content.replace(
  /const isTournament = currentCollectionCategory === 'tournament-packs';[\s\S]*?const activeGroup = isColeccionismo/g,
  `const isStoreEvents = currentCollectionCategory === 'store-events';\n                          const isChampionship = currentCollectionCategory === 'championship';\n                          const isColeccionismo = currentCollectionCategory === 'coleccionismo';\n                          \n                          const activeGroup = isColeccionismo`
);

content = content.replace(
  /\? { \n                                items: currentGroups\.find\(g => g\.category === 'Coleccionismo'\)[\s\S]*?\?\? \[\];/g,
  `? { 
                                items: currentGroups.find(g => g.category === 'Coleccionismo')
                                  ?.items.filter(sub => {
                                    const parent = currentGroups.find(g => g.category === 'Coleccionismo')?.items.find(i => i.label === currentCollectionSubCategory);
                                    if (!parent) return false;
                                    return (sub as any).isSubItem && (
                                      (parent.id === 'COL05' && sub.id.startsWith('EP')) || 
                                      (parent.id === 'COL07' && sub.id.startsWith('JP'))
                                    );
                                  }) || []
                              }
                            : isStoreEvents
                            ? {
                                items: currentGroups.find(g => g.category === 'Store Events')
                                  ?.items.find(i => i.label === currentCollectionSubCategory)?.subItems || []
                              }
                            : isChampionship
                            ? {
                                items: currentGroups.find(g => g.category === 'Championship')
                                  ?.items.find(i => i.label === currentCollectionSubCategory)?.subItems || []
                              }
                            : currentGroups.find(g => g.category === currentCollectionSubCategory);
                          
                          const items = activeGroup?.items ?? [];`
);


fs.writeFileSync('src/App.tsx', content);


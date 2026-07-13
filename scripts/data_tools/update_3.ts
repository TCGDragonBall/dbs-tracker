import fs from 'fs';

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// EP03, EP04
if (!app.includes("'MASTERS_SEALED_EP03'")) {
    app = app.replace(
        /'MASTERS_SEALED_EP02': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/110\/rk3z116268\.jpg',/g,
        "$& \n  'MASTERS_SEALED_EP03': 'https://dragonball.center/files/module_dbc/objetos/99/vomp36551.jpg',\n  'MASTERS_SEALED_EP04': 'https://dragonball.center/files/module_dbc/objetos/49/v7is116373.jpg',"
    );
    app = app.replace(
        /'SEALED_EVENT_PACK_02': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/110\/rk3z116268\.jpg',/g,
        "$& \n  'SEALED_EVENT_PACK_03': 'https://dragonball.center/files/module_dbc/objetos/99/vomp36551.jpg',\n  'SEALED_EVENT_PACK_04': 'https://dragonball.center/files/module_dbc/objetos/49/v7is116373.jpg',"
    );
    app = app.replace(
        /'MASTERS_SEALED_EP02': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_SEALED_EP03': 'bg-[50%_25%]',\n  'MASTERS_SEALED_EP04': 'bg-[50%_25%]',"
    );
    app = app.replace(
        /\{ id: 'MASTERS_SEALED_EP02', label: 'Event Pack 2018 \(Event Pack 02\)', sub: 'Event Pack' \},/g,
        "$& \n          { id: 'MASTERS_SEALED_EP03', label: 'Event Pack 03', sub: 'Event Pack' },\n          { id: 'MASTERS_SEALED_EP04', label: 'Event Pack 04', sub: 'Event Pack' },"
    );
    app = app.replace(
        /'MASTERS_SEALED_EP_FOLDER': \['SEALED_EVENT_PACK_01', 'SEALED_EVENT_PACK_02'\],/g,
        "'MASTERS_SEALED_EP_FOLDER': ['SEALED_EVENT_PACK_01', 'SEALED_EVENT_PACK_02', 'SEALED_EVENT_PACK_03', 'SEALED_EVENT_PACK_04'],"
    );
    app = app.replace(
        /'MASTERS_SEALED_EP02': \['SEALED_EVENT_PACK_02'\],/g,
        "$& \n  'MASTERS_SEALED_EP03': ['SEALED_EVENT_PACK_03'],\n  'MASTERS_SEALED_EP04': ['SEALED_EVENT_PACK_04'],"
    );
    app = app.replace(
        /\} else if \(selectedCard\.id === 'SEALED_EVENT_PACK_02'\) \{\n\s*targetExpansion = 'EP02';/g,
        "$& \n                            } else if (selectedCard.id === 'SEALED_EVENT_PACK_03') {\n                              targetExpansion = 'EP03';\n                            } else if (selectedCard.id === 'SEALED_EVENT_PACK_04') {\n                              targetExpansion = 'EP04';"
    );
}

// Ensure EP03 array starts with SEALED_EVENT_PACK_03 
if (!app.includes(`'SEALED_EVENT_PACK_03', 'BT4-012_EP03'`)) {
    app = app.replace(
        /const EVENT_PACK_03 = \[\n\s*'BT4-012_EP03'/g,
        "const EVENT_PACK_03 = [\n  'SEALED_EVENT_PACK_03', 'BT4-012_EP03'"
    );
}

// Ensure EP04 array exists, though user didn't mention its cards. We'll add SEALED_EVENT_PACK_04 if EVENT_PACK_04 exists.
if (app.includes('const EVENT_PACK_04 = [')) {
    if (!app.includes("'SEALED_EVENT_PACK_04'")) {
        app = app.replace(
            /const EVENT_PACK_04 = \[\n\s*'/g,
            "const EVENT_PACK_04 = [\n  'SEALED_EVENT_PACK_04', '"
        );
        // Fallback for one liners
        app = app.replace(
            /const EVENT_PACK_04 = \['/g,
            "const EVENT_PACK_04 = ['SEALED_EVENT_PACK_04', '"
        );
    }
}

// TP08
if (!app.includes("'MASTERS_TP08'")) {
    app = app.replace(
        /'MASTERS_TP07': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/96\/cwxq36507\.jpg',/g,
        "$& \n  'MASTERS_TP08': 'https://dragonball.center/files/module_dbc/objetos/121/r5r7116678.jpg',"
    );
    app = app.replace(
        /'MASTERS_SEALED_TP07': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/96\/cwxq36507\.jpg',/g,
        "$& \n  'MASTERS_SEALED_TP08': 'https://dragonball.center/files/module_dbc/objetos/121/r5r7116678.jpg',"
    );
    app = app.replace(
        /'SEALED_TP07': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/96\/cwxq36507\.jpg',/g,
        "$& \n  'SEALED_TP08': 'https://dragonball.center/files/module_dbc/objetos/121/r5r7116678.jpg',"
    );
    
    app = app.replace(
        /'MASTERS_TP07': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_TP08': 'bg-[50%_25%]',"
    );
    app = app.replace(
        /'MASTERS_SEALED_TP07': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_SEALED_TP08': 'bg-[50%_25%]',"
    );
    
    app = app.replace(
        /\{ id: 'MASTERS_TP07', label: 'Tournament Pack 07', sub: 'Tournament' \}\n\s*\]/g,
        "{ id: 'MASTERS_TP07', label: 'Tournament Pack 07', sub: 'Tournament' },\n          { id: 'MASTERS_TP08', label: 'Tournament Pack 08', sub: 'Tournament' }\n        ]"
    );
    app = app.replace(
        /\{ id: 'MASTERS_SEALED_TP07', label: 'Tournament Pack 07', sub: 'Tournament' \}\n\s*\]/g,
        "{ id: 'MASTERS_SEALED_TP07', label: 'Tournament Pack 07', sub: 'Tournament' },\n          { id: 'MASTERS_SEALED_TP08', label: 'Tournament Pack 08', sub: 'Tournament' }\n        ]"
    );
    
    app = app.replace(
        /'MASTERS_TP07': \{ sourceProduct: 'Tournament Pack 07' \},/g,
        "$& \n  'MASTERS_TP08': { sourceProduct: 'Tournament Pack 08' },"
    );
    
    app = app.replace(
        /'MASTERS_SEALED_TP_FOLDER': \['SEALED_TP01', 'SEALED_TP02', 'SEALED_TP03', 'SEALED_TP04', 'SEALED_TP05_2018', 'SEALED_TP05_2019', 'SEALED_TP06', 'SEALED_TP07'\],/g,
        "'MASTERS_SEALED_TP_FOLDER': ['SEALED_TP01', 'SEALED_TP02', 'SEALED_TP03', 'SEALED_TP04', 'SEALED_TP05_2018', 'SEALED_TP05_2019', 'SEALED_TP06', 'SEALED_TP07', 'SEALED_TP08'],"
    );
    app = app.replace(
        /'MASTERS_SEALED_TP07': \['SEALED_TP07'\],/g,
        "$& \n  'MASTERS_SEALED_TP08': ['SEALED_TP08'],"
    );
    
    app = app.replace(
        /'MASTERS_TP07': \['SEALED_TP07', 'P-126', 'P-127', 'P-128', 'P-129', 'P-130', 'P-131', 'P-132', 'P-133'\],/g,
        "$& \n  'MASTERS_TP08': ['SEALED_TP08', 'P-165', 'P-166', 'P-167', 'P-168', 'P-169', 'P-170', 'P-171', 'P-172'],"
    );
    
    app = app.replace(
        /\} else if \(selectedCard.id === 'SEALED_TP07'\) \{\n\s*targetExpansion = 'MASTERS_TP07';/g,
        "$& \n                            } else if (selectedCard.id === 'SEALED_TP08') {\n                              targetExpansion = 'MASTERS_TP08';"
    );
}

// Add foil for TP08 (P-165 to P-172)
const foilArr = Array.from({length: 8}, (_, i) => `'P-${165+i}'`).join(', ');
const matchStr = "'P-161', 'P-162'].includes";
const replaceStr = "'P-161', 'P-162', " + foilArr + "].includes";
if (app.includes(matchStr) && !app.includes("'P-165']")) {
    app = app.replace(matchStr, replaceStr);
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('App updated.');

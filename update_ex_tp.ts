import fs from 'fs';

let sealed = fs.readFileSync('src/data/sealed.ts', 'utf8');

if (!sealed.includes('SEALED_EX_TP')) {
    sealed += "SEALED_EX_TP\tExpansion Set Tournament Pack\t-\tSealed\t-\tSEALED_EX_TP\t-\t-\t-\t-\t-\t-\t-\t-\n";
    fs.writeFileSync('src/data/sealed.ts', sealed);
    console.log('Sealed info updated');
}

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const extpArr = "const EXPANSION_SET_TOURNAMENT_PACK = ['P-177', 'P-178', 'P-179', 'P-180', 'P-181', 'P-182', 'P-183', 'P-184', 'P-185', 'P-186'];\n";

if (!app.includes('EXPANSION_SET_TOURNAMENT_PACK')) {
    app = app.replace(
        /const EVENT_PACK_01 = \[/g,
        extpArr + "\nconst EVENT_PACK_01 = ["
    );
}

if (!app.includes("'MASTERS_EX_TP'")) {
    app = app.replace(
        /'MASTERS_TP08': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/121\/r5r7116678\.jpg',/g,
        "$& \n  'MASTERS_EX_TP': 'https://dragonball.center/files/module_dbc/objetos/117/rsb4116679.jpg',"
    );
    app = app.replace(
        /'MASTERS_SEALED_TP08': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/121\/r5r7116678\.jpg',/g,
        "$& \n  'MASTERS_SEALED_EX_TP': 'https://dragonball.center/files/module_dbc/objetos/117/rsb4116679.jpg',"
    );
    app = app.replace(
        /'SEALED_TP08': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/121\/r5r7116678\.jpg',/g,
        "$& \n  'SEALED_EX_TP': 'https://dragonball.center/files/module_dbc/objetos/117/rsb4116679.jpg',"
    );
    
    app = app.replace(
        /'MASTERS_TP08': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_EX_TP': 'bg-[50%_25%]',"
    );
    app = app.replace(
        /'MASTERS_SEALED_TP08': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_SEALED_EX_TP': 'bg-[50%_25%]',"
    );
    
    app = app.replace(
        /\{ id: 'MASTERS_TP08', label: 'Tournament Pack 08', sub: 'Tournament' \}/g,
        "$&,\n          { id: 'MASTERS_EX_TP', label: 'Expansion Set Tournament Pack', sub: 'Tournament' }"
    );
    app = app.replace(
        /\{ id: 'MASTERS_SEALED_TP08', label: 'Tournament Pack 08', sub: 'Tournament' \}/g,
        "$&,\n          { id: 'MASTERS_SEALED_EX_TP', label: 'Expansion Set Tournament Pack', sub: 'Tournament' }"
    );
    
    app = app.replace(
        /'MASTERS_TP08': \{ sourceProduct: 'Tournament Pack 08' \},/g,
        "$& \n  'MASTERS_EX_TP': { sourceProduct: 'Expansion Set Tournament Pack' },"
    );
    
    app = app.replace(
        /'MASTERS_SEALED_TP_FOLDER': \['SEALED_TP01', 'SEALED_TP02', 'SEALED_TP03', 'SEALED_TP04', 'SEALED_TP05_2018', 'SEALED_TP05_2019', 'SEALED_TP06', 'SEALED_TP07', 'SEALED_TP08'\],/g,
        "'MASTERS_SEALED_TP_FOLDER': ['SEALED_TP01', 'SEALED_TP02', 'SEALED_TP03', 'SEALED_TP04', 'SEALED_TP05_2018', 'SEALED_TP05_2019', 'SEALED_TP06', 'SEALED_TP07', 'SEALED_TP08', 'SEALED_EX_TP'],"
    );
    app = app.replace(
        /'MASTERS_SEALED_TP08': \['SEALED_TP08'\],/g,
        "$& \n  'MASTERS_SEALED_EX_TP': ['SEALED_EX_TP'],"
    );
    
    app = app.replace(
        /'MASTERS_TP08': \['SEALED_TP08', 'P-165', 'P-166', 'P-167', 'P-168', 'P-169', 'P-170', 'P-171', 'P-172'\],/g,
        "$& \n  'MASTERS_EX_TP': ['SEALED_EX_TP', ...EXPANSION_SET_TOURNAMENT_PACK],"
    );
    
    app = app.replace(
        /\} else if \(selectedCard.id === 'SEALED_TP08'\) \{\n\s*targetExpansion = 'MASTERS_TP08';/g,
        "$& \n                            } else if (selectedCard.id === 'SEALED_EX_TP') {\n                              targetExpansion = 'MASTERS_EX_TP';"
    );
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('App updated.');

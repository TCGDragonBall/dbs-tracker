import fs from 'fs';

let sealed = fs.readFileSync('src/data/sealed.ts', 'utf8');
if (!sealed.includes('SEALED_TP09')) {
    sealed = sealed.replace(
        /SEALED_TP08\tTournament Pack 08.*\n/,
        "$&SEALED_TP09\tTournament Pack 09\t-\tSealed\t-\tSEALED_TP09\t-\t-\t-\t-\t-\t-\t-\t-\n"
    );
    fs.writeFileSync('src/data/sealed.ts', sealed);
}

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

if (!app.includes("'MASTERS_TP09': 'https://dragonball.center/files/module_dbc/objetos/93/col7116757.jpg'")) {
    app = app.replace(
        /'MASTERS_TP08': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/121\/r5r7116678\.jpg',/g,
        "$& \n  'MASTERS_TP09': 'https://dragonball.center/files/module_dbc/objetos/93/col7116757.jpg',"
    );
    app = app.replace(
        /'MASTERS_SEALED_TP08': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/121\/r5r7116678\.jpg',/g,
        "$& \n  'MASTERS_SEALED_TP09': 'https://dragonball.center/files/module_dbc/objetos/93/col7116757.jpg',"
    );
    app = app.replace(
        /'SEALED_TP08': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/121\/r5r7116678\.jpg',/g,
        "$& \n  'SEALED_TP09': 'https://dragonball.center/files/module_dbc/objetos/93/col7116757.jpg',"
    );

    app = app.replace(
        /'MASTERS_TP08': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_TP09': 'bg-[50%_25%]',"
    );
    app = app.replace(
        /'MASTERS_SEALED_TP08': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_SEALED_TP09': 'bg-[50%_25%]',"
    );

    app = app.replace(
        /\{ id: 'MASTERS_TP08', label: 'Tournament Pack 08', sub: 'Tournament' \}/g,
        "$&,\n          { id: 'MASTERS_TP09', label: 'Tournament Pack 09', sub: 'Tournament' }"
    );
    app = app.replace(
        /\{ id: 'MASTERS_SEALED_TP08', label: 'Tournament Pack 08', sub: 'Tournament' \}/g,
        "$&,\n          { id: 'MASTERS_SEALED_TP09', label: 'Tournament Pack 09', sub: 'Tournament' }"
    );

    app = app.replace(
        /'MASTERS_TP08': \{ sourceProduct: 'Tournament Pack 08' \},/g,
        "$& \n  'MASTERS_TP09': { sourceProduct: 'Tournament Pack 09' },"
    );

    app = app.replace(
        /'MASTERS_SEALED_TP_FOLDER': \['SEALED_TP01', 'SEALED_TP02', 'SEALED_TP03', 'SEALED_TP04', 'SEALED_TP05_2018', 'SEALED_TP05_2019', 'SEALED_TP06', 'SEALED_TP07', 'SEALED_TP08', 'SEALED_EX_TP'\],/g,
        "'MASTERS_SEALED_TP_FOLDER': ['SEALED_TP01', 'SEALED_TP02', 'SEALED_TP03', 'SEALED_TP04', 'SEALED_TP05_2018', 'SEALED_TP05_2019', 'SEALED_TP06', 'SEALED_TP07', 'SEALED_TP08', 'SEALED_TP09', 'SEALED_EX_TP'],"
    );
    
    app = app.replace(
        /'MASTERS_SEALED_TP08': \['SEALED_TP08'\],/g,
        "$& \n  'MASTERS_SEALED_TP09': ['SEALED_TP09'],"
    );

    app = app.replace(
        /'MASTERS_TP08': \['SEALED_TP08', 'P-165', 'P-166', 'P-167', 'P-168', 'P-169', 'P-170', 'P-171', 'P-172'\],/g,
        "$& \n  'MASTERS_TP09': ['SEALED_TP09', 'P-188', 'P-189', 'P-190', 'P-191', 'P-192', 'P-193', 'P-194', 'P-195'],"
    );

    app = app.replace(
        /\} else if \(selectedCard.id === 'SEALED_TP08'\) \{\n\s*targetExpansion = 'MASTERS_TP08';/g,
        "$& \n                            } else if (selectedCard.id === 'SEALED_TP09') {\n                              targetExpansion = 'MASTERS_TP09';"
    );
}

const foilArr = Array.from({length: 8}, (_, i) => `'P-${188+i}'`).join(', ');
const matchStr = "'P-165', 'P-166', 'P-167', 'P-168', 'P-169', 'P-170', 'P-171', 'P-172'";
const replaceStr = matchStr + ", " + foilArr;

if (app.includes(matchStr) && !app.includes("'P-188', 'P-189'")) {
    app = app.replace(matchStr, replaceStr);
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('App updated.');

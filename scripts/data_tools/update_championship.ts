import fs from 'fs';

let sealed = fs.readFileSync('src/data/sealed.ts', 'utf8');
if (!sealed.includes('SEALED_CHAMPIONSHIP_2019')) {
    sealed = sealed.replace(
        /SEALED_CHAMPIONSHIP_2018\tChampionship 2018.*\n/,
        "$&SEALED_CHAMPIONSHIP_2019\tChampionship 2019\t-\tSealed\t-\tSEALED_CHAMPIONSHIP_2019\t-\t-\t-\t-\t-\t-\t-\t-\n"
    );
    fs.writeFileSync('src/data/sealed.ts', sealed);
    console.log('Added SEALED_CHAMPIONSHIP_2019 to sealed.ts');
}

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// 1. Add sealed images and mapped objects
if (!app.includes("'MASTERS_CHAMPIONSHIP_2019'")) {
    app = app.replace(
        /'MASTERS_CHAMPIONSHIP_2018': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/73\/hsci15546\.jpg',/g,
        "$& \n  'MASTERS_CHAMPIONSHIP_2019': 'https://dragonball.center/files/module_dbc/objetos/123/cmtm36514.jpg',"
    );
    app = app.replace(
        /'MASTERS_SEALED_CHAMPIONSHIP_2018': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/73\/hsci15546\.jpg',/g,
        "$& \n  'MASTERS_SEALED_CHAMPIONSHIP_2019': 'https://dragonball.center/files/module_dbc/objetos/123/cmtm36514.jpg',"
    );
    app = app.replace(
        /'SEALED_CHAMPIONSHIP_2018': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/73\/hsci15546\.jpg',/g,
        "$& \n  'SEALED_CHAMPIONSHIP_2019': 'https://dragonball.center/files/module_dbc/objetos/123/cmtm36514.jpg',"
    );
    
    app = app.replace(
        /'MASTERS_CHAMPIONSHIP_2018': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_CHAMPIONSHIP_2019': 'bg-[50%_25%]',"
    );
    app = app.replace(
        /'MASTERS_SEALED_CHAMPIONSHIP_2018': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_SEALED_CHAMPIONSHIP_2019': 'bg-[50%_25%]',"
    );
    
    app = app.replace(
        /\{ id: 'MASTERS_CHAMPIONSHIP_2018', label: 'Championship 2018', sub: 'Championship' \}/g,
        "$&,\n          { id: 'MASTERS_CHAMPIONSHIP_2019', label: 'Championship 2019', sub: 'Championship' }"
    );
    app = app.replace(
        /\{ id: 'MASTERS_SEALED_CHAMPIONSHIP_2018', label: 'Championship 2018', sub: 'Championship' \}/g,
        "$&,\n          { id: 'MASTERS_SEALED_CHAMPIONSHIP_2019', label: 'Championship 2019', sub: 'Championship' }"
    );
    
    app = app.replace(
        /'MASTERS_CHAMPIONSHIP_2018': \{ sourceProduct: 'Championship 2018' \},/g,
        "$& \n  'MASTERS_CHAMPIONSHIP_2019': { sourceProduct: 'Championship 2019' },"
    );
    
    app = app.replace(
        /'MASTERS_SEALED_CHAMPIONSHIP_FOLDER': \['SEALED_CHAMPIONSHIP_2018'\],/g,
        "'MASTERS_SEALED_CHAMPIONSHIP_FOLDER': ['SEALED_CHAMPIONSHIP_2018', 'SEALED_CHAMPIONSHIP_2019'],"
    );
    
    app = app.replace(
        /'MASTERS_SEALED_CHAMPIONSHIP_2018': \['SEALED_CHAMPIONSHIP_2018'\],/g,
        "$& \n  'MASTERS_SEALED_CHAMPIONSHIP_2019': ['SEALED_CHAMPIONSHIP_2019'],"
    );
    
    app = app.replace(
        /'MASTERS_CHAMPIONSHIP_2018': \['SEALED_CHAMPIONSHIP_2018', 'P-063', 'P-064', 'P-065', 'P-066', 'P-067'\],/g,
        "$& \n  'MASTERS_CHAMPIONSHIP_2019': ['SEALED_CHAMPIONSHIP_2019', 'P-138', 'P-139', 'P-140', 'P-141', 'P-142'],"
    );
    
    app = app.replace(
        /\} else if \(selectedCard.id === 'SEALED_CHAMPIONSHIP_2018'\) \{\n\s*targetExpansion = 'MASTERS_CHAMPIONSHIP_2018';/g,
        "$& \n                            } else if (selectedCard.id === 'SEALED_CHAMPIONSHIP_2019') {\n                              targetExpansion = 'MASTERS_CHAMPIONSHIP_2019';"
    );
}

const matchStr = "'P-131', 'P-132', 'P-133']";
const replaceStr = "'P-131', 'P-132', 'P-133', 'P-138', 'P-139', 'P-140', 'P-141', 'P-142']";
if (app.includes(matchStr) && !app.includes("'P-140']")) {
    app = app.replace(matchStr, replaceStr);
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('App updated.');

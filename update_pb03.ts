import fs from 'fs';

let sealed = fs.readFileSync('src/data/sealed.ts', 'utf8');
if (!sealed.includes('SEALED_PB03')) {
    sealed = sealed.replace(
        /SEALED_PB02\tPower Booster: Miraculous Revival.*\n/,
        "$&SEALED_PB03\tPower Booster: World Martial Arts Tournament\t-\tSealed\t-\tSEALED_PB03\t-\t-\t-\t-\t-\t-\t-\t-\n"
    );
    fs.writeFileSync('src/data/sealed.ts', sealed);
    console.log('Added SEALED_PB03 to sealed.ts');
}

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

// Add const POWER_BOOSTER_03
const pb03Arr = "const POWER_BOOSTER_03 = ['P-143', 'P-144', 'P-145', 'P-146', 'P-147', 'P-148', 'P-149', 'P-150', 'P-151', 'P-152', 'P-153', 'P-154', 'P-155', 'P-156', 'P-157', 'P-158', 'P-159', 'P-160', 'P-161', 'P-162'];\n";

if (!app.includes('POWER_BOOSTER_03')) {
    app = app.replace(
        /const POWER_BOOSTER_02 = \[.*\];\n/,
        "$&" + pb03Arr
    );
}

// 1. Add sealed images and mapped objects
if (!app.includes("'MASTERS_PB03'")) {
    app = app.replace(
        /'MASTERS_PB02': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/131\/ubym36506\.jpg',/g,
        "$& \n  'MASTERS_PB03': 'https://dragonball.center/files/module_dbc/objetos/9/yhfy36526.jpg',"
    );
    app = app.replace(
        /'MASTERS_SEALED_PB02': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/131\/ubym36506\.jpg',/g,
        "$& \n  'MASTERS_SEALED_PB03': 'https://dragonball.center/files/module_dbc/objetos/9/yhfy36526.jpg',"
    );
    app = app.replace(
        /'PB02': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/131\/ubym36506\.jpg',/g,
        "$& \n  'PB03': 'https://dragonball.center/files/module_dbc/objetos/9/yhfy36526.jpg',"
    );
    app = app.replace(
        /'SEALED_PB02': 'https:\/\/dragonball\.center\/files\/module_dbc\/objetos\/131\/ubym36506\.jpg',/g,
        "$& \n  'SEALED_PB03': 'https://dragonball.center/files/module_dbc/objetos/9/yhfy36526.jpg',"
    );
    
    app = app.replace(
        /'MASTERS_PB02': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_PB03': 'bg-[50%_25%]',"
    );
    app = app.replace(
        /'MASTERS_SEALED_PB02': 'bg-\[50%_25%\]',/g,
        "$& \n  'MASTERS_SEALED_PB03': 'bg-[50%_25%]',"
    );
    app = app.replace(
        /'PB02': 'bg-\[50%_25%\]',/g,
        "$& \n  'PB03': 'bg-[50%_25%]',"
    );
    
    app = app.replace(
        /\{ id: 'MASTERS_PB02', label: 'Power Booster: Miraculous Revival', sub: 'Power Booster' \}/g,
        "$&,\n          { id: 'MASTERS_PB03', label: 'Power Booster: World Martial Arts Tournament', sub: 'Power Booster' }"
    );
    app = app.replace(
        /\{ id: 'MASTERS_SEALED_PB02', label: 'Power Booster: Miraculous Revival', sub: 'Power Booster' \}/g,
        "$&,\n          { id: 'MASTERS_SEALED_PB03', label: 'Power Booster: World Martial Arts Tournament', sub: 'Power Booster' }"
    );
    app = app.replace(
        /\{ id: 'PB02', label: 'Power Booster: Miraculous Revival', sub: 'Power Booster' \}/g,
        "$&,\n          { id: 'PB03', label: 'Power Booster: World Martial Arts Tournament', sub: 'Power Booster' }"
    );
    
    app = app.replace(
        /'MASTERS_PB02': \{ sourceProduct: 'Power Booster: Miraculous Revival' \}/g,
        "$&, \n  'MASTERS_PB03': { sourceProduct: 'Power Booster: World Martial Arts Tournament' }"
    );
    
    app = app.replace(
        /'MASTERS_SEALED_PB_FOLDER': \['SEALED_PB01', 'SEALED_PB02'\],/g,
        "'MASTERS_SEALED_PB_FOLDER': ['SEALED_PB01', 'SEALED_PB02', 'SEALED_PB03'],"
    );
    app = app.replace(
        /'MASTERS_SEALED_PB02': \['SEALED_PB02'\],/g,
        "$& \n  'MASTERS_SEALED_PB03': ['SEALED_PB03'],"
    );
    
    app = app.replace(
        /'MASTERS_PB02': POWER_BOOSTER_02,/g,
        "$& \n  'MASTERS_PB03': ['SEALED_PB03', ...POWER_BOOSTER_03],"
    );
    
    app = app.replace(
        /PB_FOLDER: \[\.\.\.POWER_BOOSTER_01, \.\.\.POWER_BOOSTER_02\], PB01: POWER_BOOSTER_01, PB02: POWER_BOOSTER_02/g,
        "PB_FOLDER: [...POWER_BOOSTER_01, ...POWER_BOOSTER_02, ...POWER_BOOSTER_03], PB01: POWER_BOOSTER_01, PB02: POWER_BOOSTER_02, PB03: POWER_BOOSTER_03"
    );
    
    app = app.replace(
        /'PB01', 'PB02',/g,
        "'PB01', 'PB02', 'PB03',"
    );
    
    app = app.replace(
        /\} else if \(selectedCard.id === 'SEALED_PB02'\) \{\n\s*targetExpansion = 'MASTERS_PB02';/g,
        "$& \n                            } else if (selectedCard.id === 'SEALED_PB03') {\n                              targetExpansion = 'MASTERS_PB03';"
    );
}

const foilArr = Array.from({length: 20}, (_, i) => `'P-${143+i}'`).join(', ');
const matchStr = "'P-141', 'P-142'].includes";
const replaceStr = "'P-141', 'P-142', " + foilArr + "].includes";
if (app.includes(matchStr) && !app.includes("'P-143']")) {
    app = app.replace(matchStr, replaceStr);
}

fs.writeFileSync('src/TrackerApp.tsx', app);
console.log('App updated.');

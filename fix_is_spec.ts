import fs from 'fs';

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

if (!app.includes("'MASTERS_EX'")) {
    app = app.replace(
        /setId\.startsWith\('MASTERS_TP'\)/g,
        "setId.startsWith('MASTERS_TP') || setId.startsWith('MASTERS_EX')"
    );
    fs.writeFileSync('src/TrackerApp.tsx', app);
    console.log('Fixed startsWith for MASTERS_EX');
}

import fs from 'fs';

let app = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const matchStr = "'P-165', 'P-166', 'P-167', 'P-168', 'P-169', 'P-170', 'P-171', 'P-172'].includes";
const foilArr = Array.from({length: 8}, (_, i) => `'P-${188+i}'`).join(', ');
const replaceStr = "'P-165', 'P-166', 'P-167', 'P-168', 'P-169', 'P-170', 'P-171', 'P-172', " + foilArr + "].includes";

if (app.includes(matchStr)) {
    app = app.replace(matchStr, replaceStr);
    fs.writeFileSync('src/TrackerApp.tsx', app);
    console.log('Fixed foil list properly!');
} else {
    console.log('Could not find matchStr');
}

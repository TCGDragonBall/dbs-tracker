const fs = require('fs');

let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

const newOverrides = `
  'P-219_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/51/yvvb116583.jpg',
  'P-261_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/69/7u90116584.jpg',
  'P-284_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/78/bxl2116585.jpg',
  'P-293_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/109/jzb3116586.jpg',
  'P-302_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/67/bt5o116587.jpg',
  'P-310_TV_SE': 'https://dragonball.center/files/module_dbc/objetos/26/i9ya116588.jpg',
`;

if (!data.includes("'P-219_TV_SE': 'https://dragonball.center")) {
    data = data.replace('const IMAGE_OVERRIDES: Record<string, string> = {', 'const IMAGE_OVERRIDES: Record<string, string> = {' + newOverrides);
    fs.writeFileSync('src/TrackerApp.tsx', data);
    console.log("Added overrides");
} else {
    console.log("Overrides already present");
}

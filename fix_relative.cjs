const fs = require('fs');
let code = fs.readFileSync('src/TrackerApp.tsx', 'utf8');

let found = [];
let newCode = code.replace(/:\s*['"](\/?files\/module_dbc[^'"]+)['"]/g, (match, url) => {
  if (url.startsWith('/')) {
    found.push(url);
    return `: 'https://dragonball.center${url}'`;
  } else {
    found.push('/' + url);
    return `: 'https://dragonball.center/${url}'`;
  }
});

let missing = [];
let overridesMatch = newCode.match(/const IMAGE_OVERRIDES:\s*Record<string,\s*string>\s*=\s*{([\s\S]*?)};\n/);
if (overridesMatch) {
  let overridesBlock = overridesMatch[1];
  let fixedOverrides = overridesBlock.replace(/:\s*['"](\/?files\/module_dbc[^'"]+)['"]/g, (m, u) => {
      let f = u.startsWith('/') ? u : '/' + u;
      missing.push(f);
      return `: 'https://dragonball.center${f}'`;
  });
  newCode = newCode.replace(overridesMatch[1], fixedOverrides);
}


console.log("Replaced TrackerApp " + found.length + " relative URLs + overrides " + missing.length);

fs.writeFileSync('src/TrackerApp.tsx', newCode);

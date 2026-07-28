const fs = require('fs');
let data = fs.readFileSync('src/TrackerApp.tsx', 'utf8');
const match = data.match(/'P-219_TV_SE': '(.*?)'/);
if (match) {
  console.log("Found URL for P-219_TV_SE:", match[1]);
} else {
  console.log("Not found URL for P-219_TV_SE");
}

let imageOverridesStr = data.match(/const IMAGE_OVERRIDES[\s\S]*?};/);
if (imageOverridesStr) {
    let dummyObjStr = imageOverridesStr[0].replace(/const IMAGE_OVERRIDES.*?=/, 'module.exports = ');
    fs.writeFileSync('temp_overrides.cjs', dummyObjStr);
}

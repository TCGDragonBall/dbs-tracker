const fs = require('fs');

let content = fs.readFileSync('src/TrackerApp.tsx', 'utf-8');

const imageOverridesInsert = `
  'CASE-CEL19-01': 'https://dragonball.center/files/module_dbc/objetos/101/gw64117025.jpg',
  'CASE-CEL19-02': 'https://dragonball.center/files/module_dbc/objetos/12/3grk117051.jpg',
  'SEP-CEL19-01': 'https://dragonball.center/files/module_dbc/objetos/17/99ij117054.jpg',
  'SEP-CEL19-02': 'https://dragonball.center/files/module_dbc/objetos/77/glj3117055.jpg',
  'SEP-CEL19-03': 'https://dragonball.center/files/module_dbc/objetos/66/v8c5117056.jpg',
  'SEP-CEL19-04': 'https://dragonball.center/files/module_dbc/objetos/24/du9g117057.jpg',
  'SEP-CEL19-05': 'https://dragonball.center/files/module_dbc/objetos/53/vqnv117058.jpg',
  'SL-CEL19-01': 'https://dragonball.center/files/module_dbc/objetos/97/6i2l117052.jpg',
  'PM-CEL19-01': 'https://dragonball.center/files/module_dbc/objetos/109/0crb117034.png',
  'PM-CEL19-02': 'https://dragonball.center/files/module_dbc/objetos/80/5vm6117039.png',
  'PM-CEL19-03': 'https://dragonball.center/files/module_dbc/objetos/89/1yqe117040.png',
  'PM-CEL19-04': 'https://dragonball.center/files/module_dbc/objetos/86/a62m117041.png',
  'PM-CEL19-05': 'https://dragonball.center/files/module_dbc/objetos/68/np3u117042.png',
  'PM-CEL19-06': 'https://dragonball.center/files/module_dbc/objetos/121/7dl6117043.png',
  'PM-CEL19-07': 'https://dragonball.center/files/module_dbc/objetos/28/dw7v117044.png',
  'PM-CEL19-08': 'https://dragonball.center/files/module_dbc/objetos/126/1zap117045.png',
  'PM-CEL19-09': 'https://dragonball.center/files/module_dbc/objetos/91/2jcg117046.png',
  'PM-CEL19-10': 'https://dragonball.center/files/module_dbc/objetos/35/cnyk117047.png',
  'PM-CEL19-11': 'https://dragonball.center/files/module_dbc/objetos/119/0w9p117048.png',
  'PM-CEL19-12': 'https://dragonball.center/files/module_dbc/objetos/138/3r4o117049.png',
  'PM-CEL19-13': 'https://dragonball.center/files/module_dbc/objetos/138/qcnh117050.png',
  'PM-CEL19-14': 'https://dragonball.center/files/module_dbc/objetos/8/ks3e117035.png',
  'PM-CEL19-15': 'https://dragonball.center/files/module_dbc/objetos/123/qcpa117036.png',
  'PM-CEL19-16': 'https://dragonball.center/files/module_dbc/objetos/53/gcpb117037.png',
  'PM-CEL19-17': 'https://dragonball.center/files/module_dbc/objetos/1/bx80117038.png',
  'TB3-034_GS_S8': 'https://dragonball.center/files/module_dbc/objetos/110/or4q117059.png',`;
content = content.replace(/const IMAGE_OVERRIDES: Record<string, string> = \{/, "const IMAGE_OVERRIDES: Record<string, string> = {\n" + imageOverridesInsert);

fs.writeFileSync('src/TrackerApp.tsx', content, 'utf-8');
console.log("Added overrides");

const fs = require('fs');

let promosData = fs.readFileSync('src/data/promos.ts', 'utf8');

const newText = "Carta de tamaño gigante promocional sin habilidades. Entregada en eventos y torneos de presentación (como AnimeNEXT 2019 o torneo Release).";

promosData = promosData.replace(
  /BT6-105_GS\t(.*?)\t\[Permanent\] If there is a skill-less Battle Card.*?(?=\n)/g,
  `BT6-105_GS\t$1\t${newText}`
);
promosData = promosData.replace(
  /BT6-027_GS\t(.*?)\t\[Permanent\] You can't include Extra Cards.*?(?=\n)/g,
  `BT6-027_GS\t$1\t${newText}`
);
promosData = promosData.replace(
  /BT6-028_GS\t(.*?)\t\[Permanent\] You can't send cards from Drop.*?(?=\n)/g,
  `BT6-028_GS\t$1\t${newText}`
);
promosData = promosData.replace(
  /BT6-079_GS\t(.*?)\t\[Auto\] \[Burst 2\].*?(?=\n)/g,
  `BT6-079_GS\t$1\t${newText}`
);

fs.writeFileSync('src/data/promos.ts', promosData);

console.log("Replaced skill text for GS cards");

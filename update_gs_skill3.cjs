const fs = require('fs');

let promosData = fs.readFileSync('src/data/promos.ts', 'utf8');

const newText = "Carta de tamaño gigante promocional. No incluye texto de habilidad (carta en blanco al reverso/sin skills); es una carta coleccionable entregada en eventos especiales y torneos como AnimeNEXT 2019 o torneo Release.";

let lines = promosData.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.startsWith('BT6-105_GS\t') || line.startsWith('BT6-027_GS\t') || line.startsWith('BT6-028_GS\t') || line.startsWith('BT6-079_GS\t')) {
    let parts = line.split('\t');
    if (parts.length >= 14) {
      parts[13] = newText;
      lines[i] = parts.join('\t');
    }
  }
}

fs.writeFileSync('src/data/promos.ts', lines.join('\n'));

console.log("Replaced skill text for GS cards line by line");

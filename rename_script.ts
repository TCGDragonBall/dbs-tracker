import * as fs from 'fs';
import * as path from 'path';

const epCards = JSON.parse(fs.readFileSync('ep_cards.json', 'utf8'));

export function renameCards(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      renameCards(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const card of epCards) {
        // card usually looks like BT10-088_PR04
        // regex to replace exactly this ID within quotes or in text (like App.tsx arrays)
        // Let's replace the ID while preserving its base
        // base is BT10-088
        const newCard = card.replace(/_PR\d*$/, '_EP');
        if (card !== newCard && content.includes(card)) {
          // ensure we only replace exact matches to avoid partial replacements
          const regex = new RegExp(`(?<![a-zA-Z0-9_-])${card}(?![a-zA-Z0-9_-])`, 'g');
          if (regex.test(content)) {
            content = content.replace(regex, newCard);
            changed = true;
          }
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

renameCards(path.resolve('src'));

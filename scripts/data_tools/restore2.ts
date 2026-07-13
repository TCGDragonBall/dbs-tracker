import * as fs from 'fs';
import * as path from 'path';

const epCards = JSON.parse(fs.readFileSync('ep_cards.json', 'utf8'));

export function restoreCards(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      restoreCards(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const card of epCards) {
        if (card.startsWith('BT13-137')) continue; // handle manually
        const newCard = card.replace(/_PR\d*$/, '_EP');
        if (card !== newCard && content.includes(newCard)) {
          const regex = new RegExp(`(?<![a-zA-Z0-9_-])${newCard}(?![a-zA-Z0-9_-])`, 'g');
          if (regex.test(content)) {
            content = content.replace(regex, card);
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

restoreCards(path.resolve('src'));

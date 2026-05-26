import * as fs from 'fs';
import * as path from 'path';

const scrapedData = JSON.parse(fs.readFileSync('bt1_scraped.json', 'utf8'));

const bt1Path = path.join(process.cwd(), 'src', 'data', 'bt1.ts');
let bt1Content = fs.readFileSync(bt1Path, 'utf8');

// The file format is export const bt1Data = `line1\nline2\n...`;
const regex = /export const bt1Data = `([\s\S]*?)`;/;
const match = bt1Content.match(regex);

if (match) {
  const lines = match[1].split('\n');
  const newLines = lines.map(line => {
    const parts = line.split('\t');
    const cardNumber = parts[0];
    const baseCode = cardNumber.split('_')[0]; // Find base card
    
    let scraped = scrapedData.find((c: any) => c.cardNumber === cardNumber);
    if (!scraped) {
      scraped = scrapedData.find((c: any) => c.cardNumber === baseCode);
    }
    
    if (scraped && parts.length > 0 && cardNumber) {
      // Rebuild the TSV line
      // cardNumber, name, rarity, type, color, expansion, power, energy, comboEnergy, comboPower, character, specialTrait, era, skill
      const name = parts[1] || scraped.name;
      const rarity = parts[2] || '';
      const type = parts[3] || scraped.type;
      const color = parts[4] || scraped.color;
      const expansion = parts[5] || 'BT1';
      
      const formatDouble = (front: string, back: string) => back ? `${front} // ${back}` : front;
      
      const power = formatDouble(scraped.power, scraped.backPower);
      const energy = scraped.energy;
      const comboEnergy = scraped.comboEnergy;
      const comboPower = scraped.comboPower;
      const character = formatDouble(scraped.character, scraped.backCharacter);
      const specialTrait = formatDouble(scraped.specialTrait, scraped.backSpecialTrait);
      const era = formatDouble(scraped.era, scraped.backEra);
      const skill = formatDouble(scraped.skill, scraped.backSkill);
      
      return [cardNumber, name, rarity, type, color, expansion, power, energy, comboEnergy, comboPower, character, specialTrait, era, skill].join('\t');
    }
    return line;
  });
  
  const newContent = bt1Content.replace(regex, `export const bt1Data = \`${newLines.join('\n')}\`;`);
  fs.writeFileSync(bt1Path, newContent);
  console.log('Successfully updated bt1.ts');
}

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

async function run() {
  const url = 'https://www.dbs-cardgame.com/europe-en/cardlist/index.php?search=true&category=428001';
  console.log('Fetching', url);
  const response = await axios.get(url);
  const html = response.data;
  const $ = cheerio.load(html);
  
  const cards: any[] = [];

  const extractSkill = (el: any) => {
    const skillEl = $(el).find('dl.skillCol > dd').clone();
    skillEl.find('img.skillText').each((_, img) => {
      const alt = $(img).attr('alt') || '';
      $(img).replaceWith(`[${alt}]`);
    });
    skillEl.find('br').replaceWith(' | ');
    return skillEl.text().replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  };
  
  const extractEnergy = (el: any, field: string) => {
    const $field = $(el).find(`dl.${field}Col > dd`).clone();
    $field.find('img').each((_, img) => {
      const src = $(img).attr('src') || '';
      let code = '';
      if (src.includes('red')) code = 'R';
      else if (src.includes('blue')) code = 'B';
      else if (src.includes('green')) code = 'G';
      else if (src.includes('yellow')) code = 'Y';
      else if (src.includes('black')) code = 'K';
      $(img).replaceWith(code);
    });
    const text = $field.text().replace(/[^0-9A-Za-z-]/g, '').trim();
    if (!text) return '';
    const match = text.match(/([\d\-]+)([A-Z]+)/);
    if (match && match[2]) {
      return `${match[1]}(${match[2]})`;
    }
    return text.replace(/[()]/g, '');
  };

  $('ul.list-inner > li').each((_, el) => {
    // Front side
    const front = $(el).children('.cardFront').length > 0 ? $(el).children('.cardFront') : $(el).children('.cardListCol');
    
    // Sometimes there is no cardFront div explicitly but they are DL class cardListCol
    const currentEl = front.length > 0 ? front : $(el);
    
    let cardNumber = currentEl.find('dt.cardNumber').first().text().trim();
    if (!cardNumber) cardNumber = $(el).find('dt.cardNumber').first().text().trim();
    
    const name = $(el).find('dd.cardName').first().text().trim();
    const type = $(el).find('dl.typeCol > dd').first().text().trim();
    const color = $(el).find('dl.colorCol > dd').first().text().trim();
    
    const power = currentEl.find('dl.powerCol > dd').text().trim();
    const energy = extractEnergy(currentEl, 'energy');
    const comboEnergy = extractEnergy(currentEl, 'comboEnergy');
    const comboPower = currentEl.find('dl.comboPowerCol > dd').text().trim();
    const character = currentEl.find('dl.characterCol > dd').text().trim();
    const specialTrait = currentEl.find('dl.specialTraitCol > dd').text().trim();
    const era = currentEl.find('dl.eraCol > dd').text().trim();
    const skill = extractSkill(currentEl);
    
    // Back side (if Leader)
    const back = $(el).find('div.cardBack');
    let backPower = '', backCharacter = '', backSpecialTrait = '', backEra = '', backSkill = '';
    
    if (back.length > 0) {
      backPower = back.find('dl.powerCol > dd').text().trim();
      backCharacter = back.find('dl.characterCol > dd').text().trim();
      backSpecialTrait = back.find('dl.specialTraitCol > dd').text().trim();
      backEra = back.find('dl.eraCol > dd').text().trim();
      backSkill = extractSkill(back);
    }
    
    if (cardNumber) {
      cards.push({
        cardNumber, name, type, color, power, energy, comboEnergy, comboPower, character, specialTrait, era, skill,
        backPower, backCharacter, backSpecialTrait, backEra, backSkill
      });
    }
  });

  console.log(`Found ${cards.length} cards`);
  fs.writeFileSync('bt1_scraped.json', JSON.stringify(cards, null, 2));
}

run().catch(console.error);

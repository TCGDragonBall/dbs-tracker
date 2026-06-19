import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

function parseHtmlWithImages($, elem) {
  if (!elem) return '';
  const $elem = $(elem).clone();

  // Replace <br> with " | "
  $elem.find('br').replaceWith(' | ');

  // Replace <img> with their text counterparts
  $elem.find('img').each(function() {
    let alt = $(this).attr('alt') || '';
    let src = $(this).attr('src') || '';
    
    if (src.includes('red_ball.png')) {
      $(this).replaceWith('R');
    } else if (src.includes('blue_ball.png')) {
      $(this).replaceWith('B');
    } else if (src.includes('green_ball.png')) {
      $(this).replaceWith('G');
    } else if (src.includes('yellow_ball.png')) {
      $(this).replaceWith('Y');
    } else if (src.includes('black_ball.png')) {
      $(this).replaceWith('K');
    } else if (alt) {
      const altLower = alt.toLowerCase();
      if (altLower === 'red' || altLower === 'blue' || altLower === 'green' || altLower === 'yellow' || altLower === 'black') {
         $(this).replaceWith(`{${alt.charAt(0).toUpperCase()}}`);
      } else {
         $(this).replaceWith(`[${alt}]`);
      }
    } else {
      $(this).replaceWith('');
    }
  });

  let text = $elem.text().replace(/\s+/g, ' ').trim();
  // Example: "4( R R R )" -> "4(RRR)"
  text = text.replace(/\(\s*([RBGYK]+)\s*\)/g, (match, p1) => `(${p1})`);
  return text;
}

async function run() {
  console.log('Fetching BT31 card list...');
  const url = 'https://www.dbs-cardgame.com/europe-en/cardlist/?search=true&category=428031';
  
  let response;
  try {
    response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  } catch (err) {
    console.error('Error fetching URL:', err);
    return;
  }

  let html = response.data;
  
  // Replace custom tags like <Vegeta> with ＜Vegeta＞ so that Cheerio preserves them instead of treating them as invalid HTML tags
  html = html.replace(/<([^>]+)>/g, function(match, p1) {
    if (p1.match(/^[A-Z]/) && !p1.match(/^(?:IMG|BR|DIV|SPAN|A|P|TD|TR|TH|TABLE|TBODY|THEAD|UL|LI|OL|DL|DT|DD|STRONG|B|I|U|EM|H[1-6]|SCRIPT|STYLE|HEAD|BODY|HTML|META|LINK|TITLE)[\s>]/i)) {
      return `＜${p1}＞`;
    }
    return match;
  });

  const $ = cheerio.load(html);
  const cards: string[] = [];

  $('.list-inner li').each(function() {
    const cardNumber = $(this).find('.cardNumber').first().text().trim();
    if (!cardNumber) return;

    const cardNameFront = $(this).find('.cardFront .cardName').text().trim() || $(this).find('.cardName').first().text().trim();
    const cardNameBack = $(this).find('.cardBack .cardName').text().trim();

    const details: any = {};
    const backDetails: any = {};

    $(this).find('.cardFront dl').each(function() {
      const dt = $(this).find('dt').text().trim().toLowerCase();
      const dd = parseHtmlWithImages($, $(this).find('dd'));
      details[dt] = dd;
    });

    $(this).find('.cardBack dl').each(function() {
      const dt = $(this).find('dt').text().trim().toLowerCase();
      const dd = parseHtmlWithImages($, $(this).find('dd'));
      backDetails[dt] = dd;
    });

    const isLeader = details['type'] === 'LEADER';

    // Rarity extraction: e.g. "Uncommon[UC]" or "Concept Rare[CR]"
    let rarity = details['rarity'] || '';
    const rarityMatch = rarity.match(/\[(.*?)\]/);
    if (rarityMatch) {
      rarity = rarityMatch[1].toUpperCase();
    } else {
      if (rarity.includes('Promo')) rarity = 'PR';
      else if (rarity.toLowerCase().includes('secret')) rarity = 'SCR';
      else if (rarity.toLowerCase().includes('super rare')) rarity = 'SR';
      else if (rarity.toLowerCase().includes('rare')) rarity = 'R';
      else if (rarity.toLowerCase().includes('uncommon')) rarity = 'UC';
      else if (rarity.toLowerCase().includes('common')) rarity = 'C';
    }

    // Normalized card types
    let type = details['type'] || '';
    if (type === 'LEADER') type = 'Leader';
    else if (type === 'BATTLE') type = 'Battle';
    else if (type === 'EXTRA') type = 'Extra';
    else if (type === 'UNISON') type = 'Unison';
    else if (type === 'Z-BATTLE') type = 'Z-Battle';
    else if (type === 'Z-EXTRA') type = 'Z-Extra';
    else if (type === 'Z-UNISON') type = 'Z-Unison';
    else if (type) {
      type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }

    let name = cardNameBack ? `${cardNameFront} / ${cardNameBack}` : cardNameFront;
    let skill = (details['skill'] || '').replace(/\n/g, ' ').replace(/\t/g, ' ').trim();

    let power = details['power'] || '-';
    let energyColor = details['energy(color cost)'] || '-';
    let comboEnergy = details['combo energy'] || '-';
    let comboPower = details['combo power'] || '-';
    let character = details['character'] || '-';
    let specialTrait = details['special trait'] || '-';
    let era = details['era'] || '-';

    if (isLeader) {
      // Leaders have front Power // back Power, and front Character // back Character
      const backSkill = (backDetails['skill'] || '').replace(/\n/g, ' ').replace(/\t/g, ' ').trim();
      power = (details['power'] || '-') + ' // ' + (backDetails['power'] || '-');
      character = (details['character'] || '-') + ' // ' + (backDetails['character'] || '-');
      specialTrait = (details['special trait'] || '-') + ' // ' + (backDetails['special trait'] || '-');
      era = (details['era'] || '-') + ' // ' + (backDetails['era'] || '-');
      skill = skill + ' // ' + backSkill;
      
      energyColor = '-';
      comboEnergy = '-';
      comboPower = '-';
    }

    const tsvRow = [
      cardNumber,
      name,
      rarity,
      type,
      details['color'] || 'Multi',
      'BT31',
      power,
      energyColor,
      comboEnergy,
      comboPower,
      character,
      specialTrait,
      era,
      skill || '-'
    ];

    cards.push(tsvRow.join('\t'));
  });

  const content = 'export const bt31Data = `\n' + cards.join('\n') + '\n`;\n';
  fs.writeFileSync('./src/data/bt31.ts', content);
  console.log(`Saved ${cards.length} cards to ./src/data/bt31.ts`);
}

run();

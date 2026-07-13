import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

function parseHtmlWithImages($, elem) {
  if (!elem) return '';
  const $elem = $(elem).clone();

  // Replace <br> with " | "
  $elem.find('br').replaceWith(' | ');

  // Replace <img>
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
      if (alt === 'red' || alt === 'blue' || alt === 'green' || alt === 'yellow' || alt === 'black') {
         $(this).replaceWith(`{${alt.charAt(0).toUpperCase()}}`);
      } else {
         $(this).replaceWith(`[${alt}]`);
      }
    } else {
      $(this).replaceWith('');
    }
  });

  let text = $elem.text().replace(/\s+/g, ' ').trim();
  // Example for Energy cost: "4( R R R )" -> "4(RRR)"
  text = text.replace(/\(\s*([RBGYK]+)\s*\)/g, (match, p1) => `(${p1})`);
  return text;
}

async function run() {
  let { data } = await axios.get('https://www.dbs-cardgame.com/europe-en/cardlist/index.php?search=true&category=428002');
  
  // Fix character tags before parsing
  data = data.replace(/<([^>]+)>/g, function(match, p1) {
    if (p1.match(/^[A-Z]/) && !p1.match(/^(?:IMG|BR|DIV|SPAN|A|P|TD|TR|TH|TABLE|TBODY|THEAD|UL|LI|OL|DL|DT|DD|STRONG|B|I|U|EM|H[1-6]|SCRIPT|STYLE|HEAD|BODY|HTML|META|LINK|TITLE)[\s>]/i)) {
      return `＜${p1}＞`;
    }
    return match;
  });

  const $ = cheerio.load(data);
  const cards = [];
  $('.list-inner li').each(function() {
    const cardNumber = $(this).find('.cardNumber').first().text().trim();
    if (!cardNumber) return;
    const cardName = $(this).find('.cardFront .cardName').text().trim() || $(this).find('.cardName').first().text().trim();
    const backCardName = $(this).find('.cardBack .cardName').text().trim() || undefined;

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

    let rarity = details['rarity'] || '';
    const rarityMatch = rarity.match(/\[(.*?)\]/);
    if (rarityMatch) rarity = rarityMatch[1];
	else if(rarity.includes('Promo')) rarity = 'PR';
	else if(rarity === 'Secret Rare') rarity = 'SCR';
	else if(rarity === 'Super Rare') rarity = 'SR';
	else if(rarity === 'Rare') rarity = 'R';
	else if(rarity === 'Uncommon') rarity = 'UC';
	else if(rarity === 'Common') rarity = 'C';

    let skill = (details['skill'] || "").replace(/\n/g, ' ').replace(/\t/g, ' ').trim();
    let name = backCardName ? `${cardName} / ${backCardName}` : cardName;
    
    let type = details['type'] || '';
    if (type) {
      type = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    }

    const res = [
      cardNumber, // 0
      name, // 1
      rarity, // 2
      type, // 3
      details['color'] || '', // 4
      'BT2', // 5
      details['power'] || '-', // 6
      details['energy(color cost)'] || '-', // 7
      details['combo energy'] || '-', // 8
      details['combo power'] || '-', // 9
      details['character'] || '-', // 10
      details['special trait'] || '-', // 11
      details['era'] || '-', // 12
      skill || '-' // 13
    ];

    if (isLeader) {
      let backSkill = (backDetails['skill'] || "").replace(/\n/g, ' ').replace(/\t/g, ' ').trim();
      res[6] = (details['power'] || '-') + ' // ' + (backDetails['power'] || '-');
      res[10] = (details['character'] || '-') + ' // ' + (backDetails['character'] || '-');
      res[11] = (details['special trait'] || '-') + ' // ' + (backDetails['special trait'] || '-');
      res[12] = (details['era'] || '-') + ' // ' + (backDetails['era'] || '-');
      res[13] = skill + ' // ' + (backSkill || '-');
    }

    cards.push(res.join('\t'));
  });

  const content = 'export const bt2Data = `\n' + cards.join('\n') + '\n`;\n';
  fs.writeFileSync('./src/data/bt2.ts', content);
  console.log("Written to src/data/bt2.ts", cards.length);
}

run();

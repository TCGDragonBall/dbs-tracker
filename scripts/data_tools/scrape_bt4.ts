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
  text = text.replace(/\(\s*([RBGYK]+)\s*\)/g, (match, p1) => `(${p1})`);
  return text;
}

function getBaseCardNumber(num: string): string {
  const match = num.match(/^(BT4-\d+)/i);
  return match ? match[1].toUpperCase() : num.toUpperCase();
}

async function run() {
  console.log('Fetching card list for BT4 (category=428004)...');
  const url = 'https://www.dbs-cardgame.com/europe-en/cardlist/index.php?search=true&category=428004';
  
  let response;
  try {
    response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  } catch (error) {
    console.error('Failed to fetch from dbs-cardgame website:', error);
    return;
  }

  let html = response.data;
  
  // Clean up potential tag issues
  html = html.replace(/<([^>]+)>/g, function(match, p1) {
    if (p1.match(/^[A-Z]/) && !p1.match(/^(?:IMG|BR|DIV|SPAN|A|P|TD|TR|TH|TABLE|TBODY|THEAD|UL|LI|OL|DL|DT|DD|STRONG|B|I|U|EM|H[1-6]|SCRIPT|STYLE|HEAD|BODY|HTML|META|LINK|TITLE)[\s>]/i)) {
      return `＜${p1}＞`;
    }
    return match;
  });

  const $ = cheerio.load(html);
  
  // Scraped cards database maps base card number to its metadata
  const scrapedCards = new Map<string, any>();

  $('ul.list-inner > li').each(function() {
    const cardNumber = $(this).find('.cardNumber').first().text().trim();
    if (!cardNumber) return;
    
    // Normalize card key (e.g., BT4-001)
    const normalizedKey = cardNumber.toUpperCase();

    const details: any = {};
    $(this).find('.cardFront dl').each(function() {
      const dt = $(this).find('dt').text().trim().toLowerCase();
      const dd = parseHtmlWithImages($, $(this).find('dd'));
      details[dt] = dd;
    });

    const backDetails: any = {};
    $(this).find('.cardBack dl').each(function() {
      const dt = $(this).find('dt').text().trim().toLowerCase();
      const dd = parseHtmlWithImages($, $(this).find('dd'));
      backDetails[dt] = dd;
    });

    scrapedCards.set(normalizedKey, {
      cardNumber: normalizedKey,
      details,
      backDetails
    });
  });

  console.log(`Scraped ${scrapedCards.size} cards from dbs-cardgame.com`);

  // Load the current content of src/data/bt4.ts
  const bt4FileContent = fs.readFileSync('./src/data/bt4.ts', 'utf8');
  
  // Extract the string literal contents
  const matches = bt4FileContent.match(/export const bt4Data = `([\s\S]*?)`;/);
  if (!matches) {
    console.error('Could not find bt4Data template literal inside src/data/bt4.ts');
    return;
  }

  const lines = matches[1].split('\n').filter(line => line.trim());
  const updatedLines: string[] = [];

  let matchedCount = 0;
  let missingCount = 0;

  for (const line of lines) {
    const parts = line.split('\t').map(p => p.trim());
    if (parts.length < 5) {
      // Keep line as is if it's malformed
      updatedLines.push(line);
      continue;
    }

    const currentCardNumber = parts[0];
    const currentName = parts[1];
    const currentRarity = parts[2];
    const currentType = parts[3];
    const currentColor = parts[4];
    const currentExpansion = parts[5] || 'BT4';

    const baseNum = getBaseCardNumber(currentCardNumber);
    const scrapedData = scrapedCards.get(baseNum);

    if (scrapedData) {
      matchedCount++;
      const isLeader = currentType.toUpperCase() === 'LEADER';
      const front = scrapedData.details;
      const back = scrapedData.backDetails;

      const skill = (front['skill'] || '').replace(/\n/g, ' ').replace(/\t/g, ' ').trim();

      let power = front['power'] || '-';
      let energy = front['energy(color cost)'] || '-';
      let comboEnergy = front['combo energy'] || '-';
      let comboPower = front['combo power'] || '-';
      let character = front['character'] || '-';
      let specialTrait = front['special trait'] || '-';
      let era = front['era'] || '-';
      let finalSkill = skill || '-';

      if (isLeader) {
        // Leaders don't have energy / combo values
        energy = '-';
        comboEnergy = '-';
        comboPower = '-';

        // Combine Front & Back for Leader using standard ' // ' format
        const backPower = back['power'] || '-';
        const backCharacter = back['character'] || '-';
        const backSpecialTrait = back['special trait'] || '-';
        const backEra = back['era'] || '-';
        const backSkill = (back['skill'] || '').replace(/\n/g, ' ').replace(/\t/g, ' ').trim();

        power = `${power} // ${backPower}`;
        character = `${character} // ${backCharacter}`;
        specialTrait = `${specialTrait} // ${backSpecialTrait}`;
        era = `${era} // ${backEra}`;
        finalSkill = `${skill} // ${backSkill}`;
      }

      // Rebuild the complete 14-column array
      const newLineParts = [
        currentCardNumber,
        currentName,
        currentRarity,
        currentType,
        currentColor,
        currentExpansion,
        power,
        energy,
        comboEnergy,
        comboPower,
        character,
        specialTrait,
        era,
        finalSkill
      ];

      updatedLines.push(newLineParts.join('\t'));
    } else {
      missingCount++;
      console.warn(`Warning: Could not find scraped data for card ${currentCardNumber} (base: ${baseNum})`);
      // Keep existing columns, but pad with '-' up to 14 columns if needed
      while (parts.length < 14) {
        parts.push('-');
      }
      updatedLines.push(parts.join('\t'));
    }
  }

  console.log(`Successfully processed: ${matchedCount} matched, ${missingCount} not found / skipped.`);

  // Write back to src/data/bt4.ts
  const newContent = 'export const bt4Data = `\n' + updatedLines.join('\n') + '\n`;\n';
  fs.writeFileSync('./src/data/bt4.ts', newContent);
  console.log('Saved updated cards data to ./src/data/bt4.ts');
}

run().catch(console.error);

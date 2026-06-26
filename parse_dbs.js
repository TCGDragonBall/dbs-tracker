import fs from 'fs';

const html = fs.readFileSync('scrape.html', 'utf-8');

const regex = /<li\b[^>]*>([\s\S]*?)<\/li>/g;
let match;
const cards = [];

while ((match = regex.exec(html)) !== null) {
  const itemHtml = match[1];
  
  const idMatch = itemHtml.match(/<dt class="cardNumber">([^<]+)<\/dt>/);
  if (!idMatch) continue;
  const id = idMatch[1];
  
  if (!id.startsWith('P-757') && !id.startsWith('P-758') && !id.startsWith('P-759') && !id.startsWith('P-760') && !id.startsWith('P-761') && !id.startsWith('P-762')) continue;
  
  const nameMatch = itemHtml.match(/<dd class="cardName">([^<]+)<\/dd>/);
  const name = nameMatch ? nameMatch[1].trim() : '';

  const colorMatch = itemHtml.match(/<dt[^>]*>Color<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/);
  const color = colorMatch ? colorMatch[1].trim() : '';

  const typeMatch = itemHtml.match(/<dt[^>]*>Type<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/);
  const type = typeMatch ? typeMatch[1].trim() : '';

  const costMatch = itemHtml.match(/<dt>Energy(?:<span class="brk">)?\(Color Cost\)(?:<\/span>)?<\/dt>\s*<dd>([^\(]+)\(?((?:<img[^>]+>)*)\s*([^<]*)<\/dd>/);
  let cost = '';
  if (costMatch) {
    let costBase = costMatch[1].trim();
    let imgs = costMatch[2];
    let red = (imgs.match(/red_ball/g) || []).length;
    let blue = (imgs.match(/blue_ball/g) || []).length;
    let green = (imgs.match(/green_ball/g) || []).length;
    let yellow = (imgs.match(/yellow_ball/g) || []).length;
    let black = (imgs.match(/black_ball/g) || []).length;
    let white = (imgs.match(/white_ball/g) || []).length; // if exists
    let colors = 'R'.repeat(red) + 'B'.repeat(blue) + 'G'.repeat(green) + 'Y'.repeat(yellow) + 'K'.repeat(black) + 'W'.repeat(white);
    if (!costBase && colors.length === 0) cost = '-';
    else if (costBase && costBase !== '-') cost = costBase + (colors ? '(' + colors + ')' : '()');
    else cost = costBase;
  }
  
  const powerMatch = itemHtml.match(/<dt[^>]*>Power<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/);
  const power = powerMatch ? powerMatch[1].trim() : '';

  const comboPowerMatch = itemHtml.match(/<dt[^>]*>Combo Power<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/);
  const comboPower = comboPowerMatch ? comboPowerMatch[1].trim() : '';

  const comboCostMatch = itemHtml.match(/<dt[^>]*>Combo Cost<\/dt>\s*<dd[^>]*>([^<]+)<\/dd>/);
  const comboCost = comboCostMatch ? comboCostMatch[1].trim() : '';

  const eraMatch = itemHtml.match(/<dt[^>]*>Era<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/);
  const era = eraMatch ? eraMatch[1].replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim() : '';
  
  const characterMatch = itemHtml.match(/<dt[^>]*>Character<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/);
  const character = characterMatch ? characterMatch[1].replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim() : '';
  
  const traitsMatch = itemHtml.match(/<dt[^>]*>Special Trait<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/);
  const traits = traitsMatch ? traitsMatch[1].replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim() : '';

  const skillMatch = itemHtml.match(/<dt[^>]*>Skill<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/);
  let skill = skillMatch ? skillMatch[1].trim() : '';
  // process skill html if needed, replacing imgs with tags
  skill = skill.replace(/<img[^>]+alt="([^"]+)"[^>]*>/g, '[$1]');
  skill = skill.replace(/<br\s*\/?>/gi, '\n');
  skill = skill.replace(/<[^>]+>/g, '');
  skill = skill.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  // Get image path from frontImg
  const imgMatch = itemHtml.match(/<img[^>]+src="([^"]+)"[^>]*class="zoomcard"/);
  const imgUrl = imgMatch ? 'https://www.dbs-cardgame.com' + imgMatch[1].replace('../..', '') : '';

  cards.push({
    id, name, color, type, cost, power, comboPower, comboCost, era, character, traits, skill, imgUrl
  });
}

fs.writeFileSync('parsed_cards.json', JSON.stringify(cards, null, 2));
console.log('Cards parsed:', cards.length);

import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';

function parseHtmlWithImages($, elem) {
    if (!elem) return '';
    const $elem = $(elem).clone();
    
    $elem.find('br').replaceWith(' | ');
    
    $elem.find('img').each(function() {
        let alt = $(this).attr('alt') || '';
        let src = $(this).attr('src') || '';
        
        if (src.includes('red_ball')) $(this).replaceWith('R');
        else if (src.includes('blue_ball')) $(this).replaceWith('B');
        else if (src.includes('green_ball')) $(this).replaceWith('G');
        else if (src.includes('yellow_ball')) $(this).replaceWith('Y');
        else if (src.includes('black_ball')) $(this).replaceWith('K');
        else if (alt) {
            if (['red', 'blue', 'green', 'yellow', 'black'].includes(alt.toLowerCase())) {
                $(this).replaceWith(`{${alt.charAt(0).toUpperCase()}}`);
            } else {
                $(this).replaceWith(`[${alt}]`);
            }
        } else {
            $(this).replaceWith('');
        }
    });
    
    let text = $elem.text().replace(/\s+/g, ' ').trim();
    return text;
}

async function run() {
    const mainUrl = 'https://www.dbs-cardgame.com/fw/en/cardlist/?search=true&category%5B0%5D=583301';
    console.log('Fetching main list...');
    const res = await axios.get(mainUrl);
    const $ = cheerio.load(res.data);
    const links = new Set<string>();
    
    $('li.cardItem a.cardStr').each((i, el) => {
        const href = $(el).attr('data-src');
        if (href) {
            links.add(href);
        }
    });

    console.log(`Found ${links.size} items.`);
    
    let result = '';
    let cardsData = new Map();
    
    const items = Array.from(links);
    
    for (const href of items) {
        console.log(`Fetching ${href}...`);
        try {
            const detailRes = await axios.get(`https://www.dbs-cardgame.com/fw/en/cardlist/${href}`);
            const $$ = cheerio.load(detailRes.data);
            
            const cardNoMatch = href.match(/card_no=([^&]+)/);
            const cardNo = cardNoMatch ? cardNoMatch[1] : '';
            const pMatch = href.match(/p=([^&]+)/);
            const p = pMatch ? pMatch[1] : '';
            
            let finalId = cardNo;
            if (p) finalId += p;
            
            const rawName = $$('h1.cardName.is-front').first().text().trim() || $$('h1.cardName').first().text().trim();
            const backName = $$('h1.cardName.is-back').first().text().trim() || rawName;
            
            const rarity = $$('.rarity').text().trim();
            const typeText = $$('h6:contains("Card type")').next().text().trim().toLowerCase();
            const color = $$('.colValue').attr('data-color') || '';
            
            let finalType = 'Battle';
            if (typeText === 'leader') finalType = 'Leader';
            else if (typeText === 'extra') finalType = 'Extra';
            
            const cost = $$('h6:contains("Cost")').next().text().trim();
            const specCostText = $$('h6:contains("Specified cost")').next().text().replace(/\s+/g, '').trim();
            const fullCost = (cost && cost !== '-') ? `${cost}(${specCostText})` : '-';
            
            const powerFront = $$('h6:contains("Power")').nextAll('.is-front').text().trim() || $$('h6:contains("Power")').next().text().trim();
            const powerBack = $$('h6:contains("Power")').nextAll('.is-back').text().trim();
            let finalPower = powerFront;
            if (powerBack && powerBack !== powerFront && finalType === 'Leader') {
                finalPower = `${powerFront} // ${powerBack}`;
            } else if (finalType === 'Leader' && !powerBack) {
                 // Sometime they don't have .is-front, just .data
                 // finalPower is just powerFront
            } else if (finalType === 'Leader' && powerBack) {
                finalPower = `${powerFront} // ${powerBack}`;
            }

            const comboPower = $$('h6:contains("Combo power")').next().text().trim();
            const comboEnergy = '-'; // Not explicitly separated in FW usually? Or is it 0/10000? 
            let finalCombo = '-';
            let finalComboEnergy = '-';
            if (comboPower === '0') {
               finalComboEnergy = '0';
               finalCombo = '0';
            } else if (comboPower === '10000') {
               finalComboEnergy = '1';
               finalCombo = '10000';
            } else if (comboPower === '5000') {
               finalComboEnergy = '0'; // Actually FW combo cost is not explicitly 0/1 on the card but typically +10000 costs 1 or +5000 costs 0. FW cards have +5000 or +10000 combo. Let's look at the images or we can hardcode comboEnergy based on comboPower. Wait, let's just use comboPower and comboEnergy=0 for 5000 and 1 for 10000? Or just 0 for all? Let's use 0 for 5000 and 10000 because FW removed combo cost. FW cards don't have combo energy cost. So comboEnergy is always 0 or - ! wait, let's just put 0 if comboPower is number.
               finalComboEnergy = '0';
               finalCombo = '5000';
            }

            const traitsFront = $$('h6:contains("Special Traits")').nextAll('.is-front').text().trim() || $$('h6:contains("Special Traits")').next().text().trim();
            const traitsBack = $$('h6:contains("Special Traits")').nextAll('.is-back').text().trim();
            let finalTraits = traitsFront;
            if (traitsBack && finalType === 'Leader') finalTraits = `${traitsFront} // ${traitsBack}`;
            
            const skillFrontHtml = $$('h6:contains("Skills")').nextAll('.is-front');
            const skillFront = skillFrontHtml.length ? parseHtmlWithImages($$, skillFrontHtml) : parseHtmlWithImages($$, $$('h6:contains("Skills")').next());
            
            const skillBackHtml = $$('h6:contains("Skills")').nextAll('.is-back');
            const skillBack = skillBackHtml.length ? parseHtmlWithImages($$, skillBackHtml) : '';
            
            let finalSkill = skillFront || '-';
            if (skillBack && finalType === 'Leader') finalSkill = `${skillFront} // ${skillBack}`;
            
            // Re-map name for Leader
            let finalName = rawName;
            if (finalType === 'Leader' && backName && backName !== rawName) {
                 finalName = `${rawName} / ${backName}`;
            }

            // [cardId, name, rarity, type, color, expansion, power, cost, comboEnergy, comboPower, character, trait, era, skill]
            const line = [
                finalId, finalName, rarity, finalType, color, 'ST01',
                finalPower || '-', fullCost, finalComboEnergy, finalCombo, '-', finalTraits || '-', '-', finalSkill || '-'
            ].join('\t');
            
            result += line + '\n';
            
            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            console.error(`Failed ${href}`, e);
        }
    }
    
    fs.writeFileSync('st01_raw.txt', result);
    console.log('Done!');
}

run();

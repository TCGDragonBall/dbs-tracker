import axios from 'axios';
import * as cheerio from 'cheerio';

async function run() {
  const url = 'https://www.dbs-cardgame.com/europe-en/cardlist/index.php';
  try {
    const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(response.data);
    
    console.log("=== Options containing 'Starter' or 'Expert' or 'SD' ===");
    $('option').each(function() {
      const text = $(this).text().trim();
      const val = $(this).val();
      if (
        text.toLowerCase().includes('starter') || 
        text.toLowerCase().includes('expert') ||
        text.toUpperCase().includes('SD') ||
        text.toUpperCase().includes('XD')
      ) {
        console.log(`Value: "${val}" | Text: "${text}"`);
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

run();

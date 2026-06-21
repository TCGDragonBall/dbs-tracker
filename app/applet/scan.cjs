const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    const options = {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0'
      }
    };
    const req = https.request(url, options, (res) => {
      if (res.statusCode === 200) {
        console.log(`FOUND_MATCH: ${url}`);
        resolve(url);
      } else {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

async function run() {
  const ids = Array.from({ length: 22 }, (_, i) => 117429 + i);
  const prefixes = ['g36l', 'dzs9'];
  const folders = Array.from({ length: 100 }, (_, i) => i);
  
  const urls = [];
  for (const id of ids) {
    for (const prefix of prefixes) {
      for (const folder of folders) {
        urls.push(`https://dragonball.center/files/module_dbc/objetos/${folder}/${prefix}${id}.jpg`);
      }
    }
  }

  console.log(`Starting scan of ${urls.length} URLs in batches...`);
  const batchSize = 100;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.all(batch.map(url => checkUrl(url)));
  }
  console.log("Scan complete.");
}

run();

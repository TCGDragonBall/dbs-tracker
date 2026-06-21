const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', headers: { 'User-Agent': 'curl/7.68.0' } }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

async function run() {
  const folders = Array.from({length: 150}, (_, i) => i);
  const prefixes = [
    {id: 117436, p: 'nvus'},
    {id: 117437, p: 'lcq4'},
    {id: 117438, p: 'zyfi'},
    {id: 117439, p: 'v9p2'}
  ];
  
  const promises = [];
  
  for (const item of prefixes) {
    for (const f of folders) {
      const url = `https://dragonball.center/files/module_dbc/objetos/${f}/${item.p}${item.id}.jpg`;
      promises.push(checkUrl(url).then(ok => {
        if (ok) console.log(`${item.id} -> ${url}`);
      }));
    }
  }
  
  await Promise.all(promises);
}
run();

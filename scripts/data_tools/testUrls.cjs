const https = require('https');

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve(`${res.statusCode} - ${url}`);
    }).on('error', (e) => {
      resolve(`Error - ${url}`);
    });
  });
}

async function run() {
  const urls = [
    'https://www.dbs-cardgame.com/us-en/images/cards/card-back/M-01.png',
    'https://www.dbs-cardgame.com/images/cardlist/cardimg/M-01.png',
    'https://www.dbs-cardgame.com/us-en/images/cards/card-back/BT1-052_PR.png',
    'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT1-052_PR.png',
    'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT4-118_EP03.png',
    'https://www.dbs-cardgame.com/us-en/images/cards/card-back/M-11_PR.png',
    'https://www.dbs-cardgame.com/images/cardlist/cardimg/M-11_PR.png',
  ];
  const results = await Promise.all(urls.map(checkUrl));
  console.log(results.join('\n'));
}
run();

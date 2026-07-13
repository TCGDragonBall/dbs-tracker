const https = require('https');
const url100 = 'https://www.dbs-cardgame.com/images/cardlist/cardimg/BT25-100_PR02.png';
https.request(url100, { method: 'HEAD' }, (res) => {
  console.log('BT25-100_PR02.png:', res.statusCode);
}).end();

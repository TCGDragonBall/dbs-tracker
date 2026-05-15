const https = require('https');
https.get('https://tcgplayer-cdn.tcgplayer.com/product/588329_in_800x800.jpg', (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', (d) => process.stdout.write(d.length + ' bytes '));
});

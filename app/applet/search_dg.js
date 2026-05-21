const https = require('https');
https.get('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.google.com/search?q=site:dragonball.gg+banned+restricted+fusion+world'), (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const matches = parsed.contents.match(/FB0[0-9]-[0-9]{3}/g);
      if (matches) {
          console.log(Array.from(new Set(matches)));
      } else { console.log('no match') }
    } catch(e) { console.error('parse root error'); }
  });
});

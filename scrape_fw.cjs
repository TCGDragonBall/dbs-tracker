const fs = require('fs');
const https = require('https');

https.get('https://www.dbs-cardgame.com/fw/en/cardlist/?search=true&category%5B0%5D=583301', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        fs.writeFileSync('fw_st01.html', data);
        console.log('Saved to fw_st01.html');
    });
});

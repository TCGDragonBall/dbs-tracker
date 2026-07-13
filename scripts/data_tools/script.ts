import https from 'https';
function checkUrl(url: string): Promise<number> {
    return new Promise((resolve) => {
        https.get(url, (res) => {
             resolve(res.statusCode || 0);
        }).on('error', () => resolve(0));
    });
}
async function test() {
    console.log(await checkUrl('https://www.dbs-cardgame.com/images/cardlist/cardimg/EX01-01.png'));
    console.log(await checkUrl('https://www.dbs-cardgame.com/images/cardlist/cardimg/EX1-01.png'));
}
test();

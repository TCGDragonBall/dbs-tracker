async function run() {
  const res = await fetch('https://www.dbs-cardgame.com/europe-en/cardlist/index.php?search=true&free=P-757%20P-758%20P-759%20P-760%20P-761%20P-761_PR%20P-762%20P-762_PR');
  const text = await res.text();
  const fs = await import('fs');
  fs.writeFileSync('scrape.html', text);
}
run();

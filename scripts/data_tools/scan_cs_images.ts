async function checkUrl(url: string) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.status === 200) {
      console.log(`FOUND: ${url}`);
      return url;
    }
  } catch (e) {}
  return null;
}

async function run() {
  const folders = Array.from({ length: 100 }, (_, i) => i);
  const prefixes = ['g36l', 'dzs9', 'v9p0'];
  const ids = Array.from({ length: 50 }, (_, i) => 117420 + i);
  const urls: string[] = [];

  for (const id of ids) {
    for (const f of folders) {
      for (const p of prefixes) {
        urls.push(`https://dragonball.center/files/module_dbc/objetos/${f}/${p}${id}.jpg`);
        urls.push(`https://dragonball.center/files/module_dbc/objetos/${f}/${p}${id}.png`);
      }
    }
  }

  console.log(`Total URLs to check: ${urls.length}`);
  const batchSize = 150;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.all(batch.map(url => checkUrl(url)));
  }
  console.log("Done scanning.");
}

run();

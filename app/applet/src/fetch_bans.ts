async function run() {
  try {
    const res = await fetch('https://www.dbs-cardgame.com/fw/en/rules/banned_limited.php');
    if (!res.ok) console.log('fw site not ok', res.status);
    const body = await res.text();
    const regex = /(FB[0-9]{2}-[0-9]{3}|FS[0-9]{2}-[0-9]{2})/g;
    const matches = body.match(regex);
    if (matches) {
       console.log("FW Site matches:", Array.from(new Set(matches)).join(', '));
    } else {
       console.log('No FW cards found on FW site');
    }

    const res2 = await fetch('https://www.dbs-cardgame.com/europe-en/rule/banned-limited-cards.php');
    const body2 = await res2.text();
    const matches2 = body2.match(regex);
    if (matches2) {
       console.log("Masters Site FW Card matches:", Array.from(new Set(matches2)).join(', '));
    }
  } catch(e) {
    console.error(e);
  }
}
run();

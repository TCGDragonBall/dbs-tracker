import Tesseract from "tesseract.js";

const urls = [
  "https://www.dbs-cardgame.com/fw/bccard/en/news/2026/05/01/wZvjplOv3TLn7QT5/EN_FW_FP-086_Battle_PR_PARA_dummy.webp",
  "https://www.dbs-cardgame.com/fw/bccard/en/news/2026/05/01/MJlyBfrct6YlKKl5/EN_FW_FP-087_Battle_PR_PARA_dummy.webp",
  "https://www.dbs-cardgame.com/fw/bccard/en/news/2026/05/01/OXaNH3Tyf06G8waT/EN_FW_FP-088_Battle_PR_PARA_dummy.webp",
  "https://www.dbs-cardgame.com/fw/bccard/en/news/2026/05/01/toGfQwtXtjGgGOBU/EN_FW_FP-089_Battle_PR_PARA_dummy.webp",
  "https://www.dbs-cardgame.com/fw/bccard/en/news/2026/05/01/hhpAAwxYhh0BxzX3/EN_FW_FP-090_Battle_PR_PARA_dummy.webp"
];

async function run() {
  for (const url of urls) {
    console.log("Analyzing", url);
    const result = await Tesseract.recognize(url, "eng") as any;
    const words = result.data?.words || [];
    for (const w of words) {
       // power is usually a large number like 10000, 15000, 20000 located midway
       // costs are top left
       if (["Red", "Blue", "Green", "Yellow", "Black", "10000", "15000", "20000", "25000", "30000", "35000"].includes(w.text)) {
           console.log(`Word: ${w.text} at x:${w.bbox.x0}, y:${w.bbox.y0}`);
       }
    }
  }
}
run();

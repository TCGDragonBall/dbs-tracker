const Tesseract = require("tesseract.js");

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
    const { data: { text } } = await Tesseract.recognize(url, "eng");
    console.log(text.replace(/\n/g, " | "));
  }
}
run();

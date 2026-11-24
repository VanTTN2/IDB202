// Usage: node build.js 10 [1 2 ...]  -> out/Chapter_N.pptx
const L = require("./lib");
const names = { 1: "chapter_1" };
(async () => {
  const chs = process.argv.slice(2).map(Number);
  for (const n of chs) {
    const deck = L.newDeck({ title: `IDB201 Chapter ${n}` });
    require(`./content/ch${n}.js`)(deck);
    const f = `${__dirname}/out/${names[n] || "Chapter_" + n}.pptx`;
    await L.save(deck, f);
    console.log("written", f);
  }
})().catch((e) => { console.error(e); process.exit(1); });

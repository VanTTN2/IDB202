// Usage: node build.js 10 [1 2 ...]  -> out/Chapter_N.pptx
const L = require("./lib");
const names = {};
(async () => {
  const chs = process.argv.slice(2).map(Number);
  for (const n of chs) {
    const deck = L.newDeck({ title: `IDB201 Chapter ${n}` });
    const m = require(`./content/ch${n}.js`);
    if (typeof m === "function") m(deck); else L.renderChapter(deck, m);
    const f = `${__dirname}/out/${names[n] || "Chapter_" + n}.pptx`;
    await L.save(deck, f);
    console.log("written", f);
    if (L.WARN.length) { console.log(L.WARN.join("\n")); L.WARN.length = 0; }
  }
})().catch((e) => { console.error(e); process.exit(1); });

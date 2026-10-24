// IDB201 – shared slide builder.
// Every chapter deck uses the same theme, layouts, fonts and sizes.
// Usage:  node materials/slides/build_slides.js [chapterNumber ...]
//         (no argument = build all chapters found in materials/slides/content)
// Output: materials/slides/out/Chapter_N.pptx (Chapter 1 is chapter_1.pptx, as requested)

const path = require("path");
const fs = require("fs");
const pptxgen = require(path.join(__dirname, "..", "node_modules", "pptxgenjs"));

const OUT = path.join(__dirname, "out");
const CONTENT = path.join(__dirname, "content");
const COURSE = "IDB201 – Introduction to Databases";

// ---- Theme ------------------------------------------------------------------
const COL = {
  primary: "1F3B4D",   // deep slate teal: titles, dark slides
  light: "EAF0F2",     // card background
  accent: "C8553D",    // rust: badges, highlights
  text: "1E1E1E",
  muted: "5B6770",
  code: "F4F6F7",
  white: "FFFFFF",
  rule: "C9D3D8",
};
const HEAD = "Cambria";
const BODY = "Calibri";
const MONO = "Courier New";
const W = 13.333, H = 7.5;   // LAYOUT_WIDE


// ---- Overflow estimate (no renderer is available here) ----------------------
const WARN = [];
const FACTOR = { Calibri: 0.5, Cambria: 0.55, "Courier New": 0.6 };
let CUR = "";
function estimate(content, o) {
  if (!o || o.h === undefined || o.w === undefined) return;
  const face = o.fontFace || BODY;
  let paras = [];
  if (typeof content === "string") paras = content.split("\n").map(t => ({ t, size: o.fontSize || 14, bullet: false }));
  else {
    let cur = null;
    for (const r of content) {
      const ro = r.options || {};
      if (!cur) { cur = { t: "", size: ro.fontSize || o.fontSize || 14, bullet: !!ro.bullet }; paras.push(cur); }
      cur.t += r.text;
      if (ro.breakLine) cur = null;
    }
  }
  const usable = Math.max(0.5, o.w - (o.margin === 0 ? 0 : 0.2));
  let hIn = 0;
  for (const p of paras) {
    const w = usable - (p.bullet ? 0.35 : 0);
    const charsPerLine = Math.max(1, Math.floor(w * 72 / (p.size * (FACTOR[face] || 0.5) * (o.bold ? 1.06 : 1))));
    const lines = Math.max(1, Math.ceil(p.t.length / charsPerLine));
    hIn += lines * p.size * 1.2 / 72 + (paras.length > 1 ? 6 / 72 : 0);
  }
  if (hIn > o.h + 0.05) WARN.push(`${CUR}: text needs ~${hIn.toFixed(2)}in but box is ${o.h}in: "${(typeof content === "string" ? content : content.map(r => r.text).join(" ")).slice(0, 60)}…"`);
}
function addT(slide, content, o) { estimate(content, o); return slide.addText(content, o); }

function deckName(n) { return n === 1 ? "chapter_1.pptx" : `Chapter_${n}.pptx`; }

function defineLayouts(pres, ch) {
  const footer = `${COURSE}  ·  Chapter ${ch.num}: ${ch.short || ch.title}`;
  pres.defineSlideMaster({
    title: "CONTENT",
    background: { color: COL.white },
    objects: [
      { text: { text: footer, options: { x: 0.5, y: 7.0, w: 10.5, h: 0.3, fontFace: BODY, fontSize: 10, color: COL.muted, margin: 0 } } },
    ],
    slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontFace: BODY, fontSize: 10, color: COL.muted, align: "right" },
  });
  pres.defineSlideMaster({ title: "DARK", background: { color: COL.primary }, objects: [] });
}

function title(slide, text) {
  addT(slide, text, { x: 0.5, y: 0.35, w: 12.3, h: 0.85, fontFace: HEAD, fontSize: 30, bold: true,
    color: COL.primary, valign: "middle", margin: 0, isTextBox: true });
}

function bulletRuns(items, size) {
  // item: "text" | {t:"text", sub:true} | {t:"text", b:"bold prefix"}
  const runs = [];
  items.forEach((it, i) => {
    const o = typeof it === "string" ? { t: it } : it;
    const last = i === items.length - 1;
    const base = { bullet: o.sub ? { indent: 18 } : true, indentLevel: o.sub ? 1 : 0, paraSpaceAfter: 6,
      fontSize: o.sub ? size - 2 : size, color: COL.text, breakLine: !last };
    if (o.b) {
      runs.push({ text: o.b + " ", options: { ...base, bold: true, breakLine: false, color: COL.primary } });
      runs.push({ text: o.t, options: { fontSize: base.fontSize, color: COL.text, breakLine: !last } });
    } else {
      runs.push({ text: o.t, options: base });
    }
  });
  return runs;
}

function card(slide, x, y, w, h, heading, body, opts = {}) {
  slide.addShape("roundRect", { x, y, w, h, fill: { color: opts.fill || COL.light }, line: { color: opts.fill || COL.light },
    rectRadius: 0.12, objectName: "card" });
  if (heading) addT(slide, heading, { x: x + 0.25, y: y + 0.15, w: w - 0.5, h: 0.45, fontFace: HEAD, fontSize: 16,
    bold: true, color: opts.headColor || COL.accent, margin: 0, isTextBox: true });
  const top = heading ? y + 0.65 : y + 0.2;
  if (Array.isArray(body)) {
    addT(slide, bulletRuns(body, opts.size || 14), { x: x + 0.2, y: top, w: w - 0.4, h: h - (top - y) - 0.15,
      fontFace: BODY, valign: "top", margin: 2, isTextBox: true });
  } else if (body) {
    addT(slide, body, { x: x + 0.25, y: top, w: w - 0.5, h: h - (top - y) - 0.15, fontFace: BODY,
      fontSize: opts.size || 14, color: COL.text, valign: "top", margin: 0, isTextBox: true });
  }
}

function badge(slide, x, y, label, d = 0.55) {
  slide.addShape("ellipse", { x, y, w: d, h: d, fill: { color: COL.accent }, line: { color: COL.accent } });
  addT(slide, String(label), { x, y, w: d, h: d, fontFace: HEAD, fontSize: 16, bold: true, color: COL.white,
    align: "center", valign: "middle", margin: 0, isTextBox: true });
}

// ---- Slide types ------------------------------------------------------------
const R = {
  cover(pres, ch) {
    const s = pres.addSlide({ masterName: "DARK" });
    addT(s, COURSE, { x: 0.8, y: 0.8, w: 11.7, h: 0.5, fontFace: BODY, fontSize: 16, color: "CADCE3", margin: 0, isTextBox: true });
    addT(s, `Chapter ${ch.num}`, { x: 0.8, y: 1.9, w: 11.7, h: 0.8, fontFace: HEAD, fontSize: 28, color: "F2B8A8", bold: true, margin: 0, isTextBox: true });
    addT(s, ch.title, { x: 0.8, y: 2.7, w: 11.7, h: 1.7, fontFace: HEAD, fontSize: 40, color: COL.white, bold: true, valign: "top", margin: 0, isTextBox: true });
    addT(s, [
      { text: `Sessions ${ch.sessions.join(", ")}`, options: { breakLine: true } },
      { text: `Main textbook: Silberschatz, Korth & Sudarshan, Database System Concepts, 7th ed. (2020) – ${ch.reading}` },
    ], { x: 0.8, y: 5.2, w: 11.7, h: 1.0, fontFace: BODY, fontSize: 16, color: "CADCE3", valign: "top", margin: 0, isTextBox: true });
    if (ch.coverNotes) s.addNotes(ch.coverNotes);
  },

  outline(pres, ch, sl) {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, sl.title || "Chapter roadmap");
    const items = sl.items; const n = items.length;
    const colW = (12.3 - 0.3 * (n - 1)) / n;
    items.forEach((it, i) => {
      const x = 0.5 + i * (colW + 0.3);
      s.addShape("roundRect", { x, y: 1.6, w: colW, h: 4.9, fill: { color: COL.light }, line: { color: COL.light }, rectRadius: 0.12 });
      badge(s, x + 0.25, 1.85, it.session, 0.75);
      addT(s, "Session", { x: x + 1.1, y: 1.9, w: colW - 1.2, h: 0.3, fontFace: BODY, fontSize: 12, color: COL.muted, margin: 0, isTextBox: true });
      addT(s, it.head, { x: x + 1.1, y: 2.15, w: colW - 1.2, h: 0.45, fontFace: HEAD, fontSize: 15, bold: true, color: COL.primary, margin: 0, isTextBox: true });
      addT(s, bulletRuns(it.points, 14), { x: x + 0.15, y: 2.85, w: colW - 0.3, h: 3.5, fontFace: BODY, valign: "top", margin: 2, isTextBox: true });
    });
    if (sl.notes) s.addNotes(sl.notes);
  },

  session(pres, ch, sl) {
    const s = pres.addSlide({ masterName: "DARK" });
    addT(s, `Session ${sl.n}`, { x: 0.8, y: 1.6, w: 11.7, h: 0.9, fontFace: HEAD, fontSize: 36, color: "F2B8A8", bold: true, margin: 0, isTextBox: true });
    addT(s, sl.title, { x: 0.8, y: 2.6, w: 11.7, h: 2.0, fontFace: HEAD, fontSize: 30, color: COL.white, bold: true, valign: "top", margin: 0, isTextBox: true });
    addT(s, `Read before class: ${sl.reading}`, { x: 0.8, y: 5.0, w: 11.7, h: 0.9, fontFace: BODY, fontSize: 16, color: "CADCE3", valign: "top", margin: 0, isTextBox: true });
    if (sl.notes) s.addNotes(sl.notes);
  },

  bullets(pres, ch, sl) {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, sl.title);
    const hasCard = !!sl.card;
    addT(s, bulletRuns(sl.bullets, sl.size || 16), { x: 0.5, y: 1.45, w: hasCard ? 7.7 : 12.3, h: 5.35,
      fontFace: BODY, valign: "top", margin: 2, isTextBox: true });
    if (hasCard) card(s, 8.6, 1.5, 4.2, sl.card.h || 3.6, sl.card.head, sl.card.body, { size: 14 });
    if (sl.notes) s.addNotes(sl.notes);
  },

  cards(pres, ch, sl) {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, sl.title);
    const items = sl.items; const n = items.length;
    const cols = n <= 3 ? n : 2; const rows = Math.ceil(n / cols);
    const top = sl.lead ? 2.15 : 1.5;
    if (sl.lead) addT(s, sl.lead, { x: 0.5, y: 1.4, w: 12.3, h: 0.6, fontFace: BODY, fontSize: 16, color: COL.text, margin: 0, isTextBox: true });
    const cw = (12.3 - 0.3 * (cols - 1)) / cols;
    const chh = (6.75 - top - 0.3 * (rows - 1)) / rows;
    items.forEach((it, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      const x = 0.5 + c * (cw + 0.3), y = top + r * (chh + 0.3);
      s.addShape("roundRect", { x, y, w: cw, h: chh, fill: { color: COL.light }, line: { color: COL.light }, rectRadius: 0.12 });
      badge(s, x + 0.2, y + 0.2, it.badge || (i + 1), 0.5);
      addT(s, it.head, { x: x + 0.85, y: y + 0.2, w: cw - 1.05, h: 0.5, fontFace: HEAD, fontSize: 16, bold: true, color: COL.primary, valign: "middle", margin: 0, isTextBox: true });
      const body = Array.isArray(it.body) ? bulletRuns(it.body, 14) : it.body;
      addT(s, body, { x: x + 0.2, y: y + 0.8, w: cw - 0.4, h: chh - 0.95, fontFace: BODY, fontSize: 14, color: COL.text, valign: "top", margin: 2, isTextBox: true });
    });
    if (sl.notes) s.addNotes(sl.notes);
  },

  code(pres, ch, sl) {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, sl.title);
    const cw = sl.bullets ? 7.2 : 12.3;
    const lines = sl.code.split("\n").length;
    const fs_ = sl.codeSize || (lines > 16 ? 12 : 14);
    s.addShape("roundRect", { x: 0.5, y: 1.45, w: cw, h: 5.3, fill: { color: COL.code }, line: { color: COL.rule }, rectRadius: 0.08 });
    addT(s, sl.code, { x: 0.7, y: 1.6, w: cw - 0.4, h: 5.0, fontFace: MONO, fontSize: fs_, color: COL.text, valign: "top", margin: 0, isTextBox: true });
    if (sl.bullets) {
      if (sl.side) addT(s, sl.side, { x: 8.0, y: 1.45, w: 4.8, h: 0.45, fontFace: HEAD, fontSize: 16, bold: true, color: COL.accent, margin: 0, isTextBox: true });
      addT(s, bulletRuns(sl.bullets, 15), { x: 8.0, y: sl.side ? 2.0 : 1.45, w: 4.8, h: sl.side ? 4.75 : 5.3, fontFace: BODY, valign: "top", margin: 2, isTextBox: true });
    }
    if (sl.notes) s.addNotes(sl.notes);
  },

  table(pres, ch, sl) {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, sl.title);
    const fsz = sl.size || 14;
    const head = sl.head.map(h => ({ text: h, options: { bold: true, color: COL.white, fill: { color: COL.primary }, fontFace: BODY, fontSize: fsz } }));
    const rows = sl.rows.map((r, i) => r.map(c => ({ text: String(c), options: { fontFace: c && sl.mono ? MONO : BODY, fontSize: fsz, color: COL.text,
      fill: { color: i % 2 ? COL.white : COL.light } } })));
    const top = sl.lead ? 2.05 : 1.5;
    if (sl.lead) addT(s, sl.lead, { x: 0.5, y: 1.4, w: 12.3, h: 0.55, fontFace: BODY, fontSize: 16, color: COL.text, margin: 0, isTextBox: true });
    { // estimate table height
      const cw = sl.colW || sl.head.map(() => 12.3 / sl.head.length);
      let hh = 0;
      [sl.head, ...sl.rows].forEach(r => {
        let lines = 1;
        r.forEach((c, j) => { const cpl = Math.max(1, Math.floor((cw[j] - 0.15) * 72 / (fsz * (sl.mono ? 0.6 : 0.5)))); lines = Math.max(lines, ...String(c).split("\n").map(x => Math.ceil(Math.max(1, x.length) / cpl))); });
        hh += lines * fsz * 1.2 / 72 + 0.14;
      });
      const limit = (sl.caption ? 6.3 : 6.85) - top;
      if (hh > limit) WARN.push(`${CUR}: table needs ~${hh.toFixed(2)}in, room ${limit.toFixed(2)}in`);
    }
    s.addTable([head, ...rows], { x: 0.5, y: top, w: 12.3, colW: sl.colW, border: { type: "solid", pt: 0.75, color: COL.rule }, valign: "middle", margin: 0.06 });
    if (sl.caption) addT(s, sl.caption, { x: 0.5, y: 6.35, w: 12.3, h: 0.45, fontFace: BODY, fontSize: 12, italic: true, color: COL.muted, margin: 0, isTextBox: true });
    if (sl.notes) s.addNotes(sl.notes);
  },

  twocol(pres, ch, sl) {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, sl.title);
    if (sl.lead) addT(s, sl.lead, { x: 0.5, y: 1.4, w: 12.3, h: 0.6, fontFace: BODY, fontSize: 16, color: COL.text, margin: 0, isTextBox: true });
    const top = sl.lead ? 2.15 : 1.5, hh = 6.75 - top;
    card(s, 0.5, top, 6.0, hh, sl.left.head, sl.left.items, { size: 15, headColor: COL.primary });
    card(s, 6.8, top, 6.0, hh, sl.right.head, sl.right.items, { size: 15, headColor: COL.accent });
    if (sl.notes) s.addNotes(sl.notes);
  },

  cq(pres, ch, sl) {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, `Constructivist question ${sl.code}`);
    s.addShape("roundRect", { x: 0.5, y: 1.5, w: 12.3, h: 1.9, fill: { color: COL.primary }, line: { color: COL.primary }, rectRadius: 0.12 });
    addT(s, sl.question, { x: 0.9, y: 1.6, w: 11.5, h: 1.7, fontFace: HEAD, fontSize: 20, italic: true, color: COL.white, valign: "middle", margin: 0, isTextBox: true });
    addT(s, "Discussion prompts", { x: 0.5, y: 3.65, w: 6, h: 0.4, fontFace: HEAD, fontSize: 16, bold: true, color: COL.accent, margin: 0, isTextBox: true });
    addT(s, bulletRuns(sl.prompts, 15), { x: 0.5, y: 4.1, w: 7.6, h: 2.65, fontFace: BODY, valign: "top", margin: 2, isTextBox: true });
    card(s, 8.6, 3.65, 4.2, 3.1, "Where to look", sl.where, { size: 14 });
    if (sl.notes) s.addNotes(sl.notes);
  },

  summary(pres, ch, sl) {
    const s = pres.addSlide({ masterName: "CONTENT" });
    title(s, sl.title || "Summary and next steps");
    card(s, 0.5, 1.5, 7.4, 5.25, "Key points", sl.points, { size: 15, headColor: COL.primary });
    card(s, 8.2, 1.5, 4.6, 5.25, "Before the next session", sl.next, { size: 14 });
    if (sl.notes) s.addNotes(sl.notes);
  },
};

async function buildChapter(file) {
  const ch = require(path.join(CONTENT, file));
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "IDB201 course team";
  pres.title = `IDB201 Chapter ${ch.num} – ${ch.title}`;
  pres.theme = { headFontFace: HEAD, bodyFontFace: BODY };
  defineLayouts(pres, ch);
  R.cover(pres, ch);
  let k = 1;
  for (const sl of ch.slides) {
    k += 1; CUR = `Ch${ch.num} slide ${k} (${sl.t})`;
    if (!R[sl.t]) throw new Error(`Chapter ${ch.num}: unknown slide type ${sl.t}`);
    R[sl.t](pres, ch, sl);
  }
  fs.mkdirSync(OUT, { recursive: true });
  const out = path.join(OUT, deckName(ch.num));
  await pres.writeFile({ fileName: out });
  console.log(`Saved ${out} (${ch.slides.length + 1} slides)`);
  WARN.splice(0).forEach(w => console.log('  WARN ' + w));
}

(async () => {
  const want = process.argv.slice(2).map(Number);
  const files = fs.readdirSync(CONTENT).filter(f => /^ch\d+\.js$/.test(f))
    .filter(f => !want.length || want.includes(Number(f.match(/\d+/)[0])))
    .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));
  for (const f of files) await buildChapter(f);
})();

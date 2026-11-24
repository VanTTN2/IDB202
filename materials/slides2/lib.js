// IDB201 slide builder (round-2 revision after the council review of 18 Nov 2026).
// Rules from form BM.09: FPT University logo on the first slide and on every slide;
// title 32-44 pt, body 24 pt, captions/sources >= 18 pt (diagram labels included);
// at most two fonts (Arial for all text, Courier New for code); a source line on every
// content slide; no near-empty slides; at least 10 slides per session.
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require("/root/.claude/skills/synced/c0f42394-595b-4c69-8b28-8d3dbc928f1c_a29b3fb3-0874-44bb-9584-3853497a7da1/pptx/scripts/apply_theme.js");

const LOGO = path.join(__dirname, "assets", "fptu_logo.png");
const HEX = { navy: "0B3C6E", orange: "F27024", ink: "1E1E1E", grey: "5F6B76", pale: "EEF2F7", paleOrange: "FDEBDD",
              green: "1E7D45", red: "B3261E", white: "FFFFFF", line: "9AA7B4" };
const THEME = {
  name: "IDB201 FPTU",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: { dk1: HEX.ink, lt1: HEX.white, dk2: HEX.navy, lt2: HEX.pale, accent1: HEX.navy, accent2: HEX.orange,
            accent3: HEX.green, accent4: HEX.red, accent5: HEX.grey, accent6: HEX.paleOrange, hlink: HEX.navy, folHlink: HEX.grey },
};
const CODE = "Courier New";
const SZ = { title: 36, body: 24, sub: 22, table: 22, code: 20, caption: 18, label: 18 };
const W = 13.333, H = 7.5;
const X0 = 0.6, CW = W - 2 * X0;        // content left edge and width
const Y0 = 1.45, YB = 6.55;             // content top and bottom

function newDeck(meta) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.author = "IDB201 course team";
  pres.company = "FPT University";
  pres.title = meta.title;
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: "IDB201 cover",
    background: { color: HEX.navy },
    objects: [
      { rect: { x: 0.6, y: 0.5, w: 2.6, h: 1.55, fill: { color: HEX.white }, rectRadius: 0.1 } },
      { image: { path: LOGO, x: 0.75, y: 0.6, w: 2.3, h: 1.36 } },
    ],
  });
  pres.defineSlideMaster({
    title: "IDB201 session",
    background: { color: HEX.navy },
    objects: [
      { rect: { x: 11.35, y: 0.3, w: 1.55, h: 0.95, fill: { color: HEX.white }, rectRadius: 0.08 } },
      { image: { path: LOGO, x: 11.45, y: 0.36, w: 1.35, h: 0.8 } },
    ],
    slideNumber: { x: 12.2, y: 6.9, w: 0.8, h: 0.4, fontSize: SZ.caption, color: HEX.white, align: "right" },
  });
  pres.defineSlideMaster({
    title: "IDB201 content",
    background: { color: HEX.white },
    objects: [
      { image: { path: LOGO, x: 11.65, y: 0.28, w: 1.15, h: 0.68 } },
      { placeholder: { options: { name: "title", type: "title", x: X0, y: 0.3, w: 10.8, h: 0.85, fontSize: SZ.title, bold: true,
                                  color: HEX.navy, valign: "middle", margin: 0 }, text: "" } },
    ],
    slideNumber: { x: 12.2, y: 6.9, w: 0.8, h: 0.4, fontSize: SZ.caption, color: HEX.grey, align: "right" },
  });

  const deck = { pres, C, meta, sections: [] };
  return deck;
}

function section(deck, title) { deck.pres.addSection({ title }); deck.currentSection = title; }

function cover(deck, o) {
  const s = deck.pres.addSlide({ masterName: "IDB201 cover", sectionTitle: deck.currentSection });
  s.addText(o.course, { x: 3.5, y: 0.75, w: 9, h: 0.6, fontSize: 24, color: HEX.white, isTextBox: true, margin: 0 });
  s.addText(o.chapter, { x: 0.6, y: 2.55, w: 12, h: 0.7, fontSize: 32, bold: true, color: HEX.orange, isTextBox: true, margin: 0 });
  const ts = o.title.length > 44 ? 36 : 44;
  s.addText(o.title, { x: 0.6, y: 3.25, w: 12, h: 1.5, fontSize: ts, bold: true, color: HEX.white, isTextBox: true, margin: 0, valign: "top" });
  s.addText(o.sessions, { x: 0.6, y: 4.85, w: 12, h: 0.5, fontSize: 24, color: HEX.white, isTextBox: true, margin: 0 });
  s.addText(o.textbook, { x: 0.6, y: 5.45, w: 12, h: 1.6, fontSize: SZ.caption, color: "D6E0EB", isTextBox: true, margin: 0, valign: "top" });
  if (o.notes) s.addNotes(o.notes);
  return s;
}

function divider(deck, o) {
  const s = deck.pres.addSlide({ masterName: "IDB201 session", sectionTitle: deck.currentSection });
  s.addText(o.label, { x: 0.6, y: 1.7, w: 10, h: 0.7, fontSize: 32, bold: true, color: HEX.orange, isTextBox: true, margin: 0 });
  let ts = 36; while (ts > 26 && Math.ceil(o.title.length * ts * 0.55 / 72 / 11.8) * ts * 1.2 / 72 > 2.5) ts -= 2;
  s.addText(o.title, { x: 0.6, y: 2.45, w: 11.8, h: 2.6, fontSize: ts, bold: true, color: HEX.white, isTextBox: true, margin: 0, valign: "top" });
  s.addText(o.read, { x: 0.6, y: 5.15, w: 11.8, h: 1.6, fontSize: SZ.caption + 2, color: "D6E0EB", isTextBox: true, margin: 0, valign: "top" });
  if (o.notes) s.addNotes(o.notes);
  return s;
}

function content(deck, title, source, notes) {
  if (title.length > 44) (module.exports.WARN || []).push(`title may wrap: ${title}`);
  const s = deck.pres.addSlide({ masterName: "IDB201 content", sectionTitle: deck.currentSection });
  s.addText(title, { placeholder: "title" });
  if (source) s.addText(source, { x: X0, y: 6.9, w: 11.2, h: 0.4, fontSize: SZ.caption, italic: true, color: HEX.grey, isTextBox: true, margin: 0, valign: "middle" });
  if (notes) s.addNotes(notes);
  return s;
}

// items: strings, or {t, lvl, b} ; lvl 1 = sub-point
function bullets(s, items, x, y, w, h, o = {}) {
  const size = o.size || SZ.body;
  const runs = items.map((it, i) => {
    const it2 = typeof it === "string" ? { t: it } : it;
    const sub = it2.lvl === 1;
    return { text: it2.t, options: { bullet: o.nobullet ? false : (sub ? { indent: 22 } : { indent: 24 }), indentLevel: sub ? 1 : 0,
      fontSize: sub ? SZ.sub : size, bold: !!it2.b, color: it2.c || HEX.ink, breakLine: i < items.length - 1,
      paraSpaceAfter: o.gap === undefined ? 8 : o.gap } };
  });
  s.addText(runs, { x, y, w, h, valign: o.valign || "top", isTextBox: true, margin: [2, 4, 2, 0], fit: "none" });
}

function text(s, t, x, y, w, h, o = {}) {
  s.addText(t, Object.assign({ x, y, w, h, fontSize: SZ.body, color: HEX.ink, valign: "top", isTextBox: true, margin: 0 }, o));
}

// card with heading; body is a string or bullet list
function card(s, x, y, w, h, head, body, o = {}) {
  s.addShape("roundRect", { x, y, w, h, fill: { color: o.fill || HEX.pale }, line: { color: o.fill || HEX.pale }, rectRadius: 0.08 });
  let yy = y + 0.15;
  if (o.num !== undefined) {
    s.addShape("ellipse", { x: x + 0.2, y: y + 0.18, w: 0.55, h: 0.55, fill: { color: HEX.orange }, line: { color: HEX.orange } });
    s.addText(String(o.num), { x: x + 0.2, y: y + 0.18, w: 0.55, h: 0.55, fontSize: 22, bold: true, color: HEX.white, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  }
  const hx = o.num !== undefined ? x + 0.9 : x + 0.25;
  if (head) {
    const hw = w - (hx - x) - 0.2, hl = Math.max(1, Math.ceil(head.length * SZ.body * 0.56 / 72 / hw));
    const hh = 0.42 * hl + 0.18;
    s.addText(head, { x: hx, y: yy, w: hw, h: hh, fontSize: SZ.body, bold: true, color: o.headColor || HEX.navy, valign: "middle", isTextBox: true, margin: 0 });
    yy += hh + 0.1;
  }
  if (Array.isArray(body)) bullets(s, body, x + 0.25, yy, w - 0.45, h - (yy - y) - 0.1, { size: o.size || SZ.body, gap: 4 });
  else if (body) s.addText(body, { x: x + 0.25, y: yy, w: w - 0.45, h: h - (yy - y) - 0.1, fontSize: o.size || SZ.body, color: HEX.ink, valign: "top", isTextBox: true, margin: 0 });
}

function code(s, t, x, y, w, h, o = {}) {
  s.addShape("rect", { x, y, w, h, fill: { color: "F4F6F8" }, line: { color: "D5DCE3", width: 1 } });
  s.addText(t, { x: x + 0.15, y: y + 0.1, w: w - 0.3, h: h - 0.2, fontFace: CODE, fontSize: o.size || SZ.code, color: HEX.ink, valign: "top", isTextBox: true, margin: 0 });
}

function table(s, rows, x, y, w, o = {}) {
  const size = o.size || SZ.table;
  const data = rows.map((r, i) => r.map((c) => {
    const cell = typeof c === "object" && c !== null && c.text !== undefined ? c : { text: String(c) };
    const opts = Object.assign({ fontSize: size, color: HEX.ink, valign: "middle", margin: [3, 6, 3, 6] }, cell.options || {});
    if (i === 0 && o.header !== false) Object.assign(opts, { bold: true, color: HEX.white, fill: { color: HEX.navy } });
    else if (o.zebra !== false && i % 2 === 0) opts.fill = opts.fill || { color: "F4F6F8" };
    return { text: cell.text, options: opts };
  }));
  s.addTable(data, { x, y, w, colW: o.colW, rowH: o.rowH || 0.5, border: { type: "solid", pt: 1, color: "C9D2DC" }, fontFace: o.mono ? CODE : undefined, autoPage: false });
}

// --- diagram helpers (labels >= 18 pt) ---
function node(s, t, x, y, w, h, o = {}) {
  s.addShape(o.shape || "roundRect", { x, y, w, h, fill: { color: o.fill || HEX.white }, line: { color: o.lineColor || HEX.navy, width: o.lw || 2 }, rectRadius: 0.1 });
  s.addText(t, { x, y, w, h, fontSize: o.size || SZ.label + 2, bold: o.bold !== false, color: o.color || HEX.navy, align: "center", valign: "middle", isTextBox: true, margin: 2, fontFace: o.mono ? CODE : undefined });
}
function arrow(s, x1, y1, x2, y2, o = {}) {
  const x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x2 - x1), h = Math.abs(y2 - y1);
  s.addShape("line", { x, y, w: w || 0.001, h: h || 0.001, flipH: x2 < x1, flipV: y2 < y1,
    line: { color: o.color || HEX.navy, width: o.width || 2.25, endArrowType: o.noHead ? undefined : "triangle", dashType: o.dash || "solid" } });
  if (o.label) s.addText(o.label, { x: o.lx !== undefined ? o.lx : (x1 + x2) / 2 - 1.5, y: o.ly !== undefined ? o.ly : (y1 + y2) / 2 - 0.45,
    w: o.lw || 3, h: 0.4, fontSize: SZ.label, color: o.labelColor || HEX.grey, align: o.lalign || "center", italic: !!o.italic, isTextBox: true, margin: 0 });
}

async function save(deck, file) {
  await deck.pres.writeFile({ fileName: file });
  await applyTheme(file, THEME);
  return file;
}

module.exports = { newDeck, section, cover, divider, content, bullets, text, card, code, table, node, arrow, save, HEX, SZ, X0, CW, Y0, YB, W, H, CODE };

// ---------------------------------------------------------------------------
// Data-driven engine used by chapters 1-9 (chapter 10 is written slide by slide).
// Text that would not fit at the default size is reduced in steps, never below 20 pt
// (body) or 18 pt (captions); anything still too long is reported so it can be split.
const SCHED = require("./schedule.json");
const CQS = require("./cq.json");
const CLOS = require("./clo.json");
const WARN = [];
function estH(items, w, size, gap = 8) {           // inches needed for a list of strings
  const cpl = Math.max(8, Math.floor((w * 72) / (size * 0.52)));
  let lines = 0;
  for (const t of items) for (const part of String(t).split("\n")) lines += Math.max(1, Math.ceil(part.length / cpl));
  return (lines * size * 1.2 + items.length * gap) / 72;
}
function fitSize(items, w, h, start = SZ.body, min = 20, gap = 8) {
  for (let s = start; s >= min; s -= 2) if (estH(items, w, s, gap) <= h) return s;
  return null;
}
function autoBullets(s, items, x, y, w, h, where, o = {}) {
  const plain = items.map((i) => (typeof i === "string" ? i : i.t));
  const size = fitSize(plain, w - 0.35, h, o.size || SZ.body, 20, o.gap === undefined ? 8 : o.gap);
  if (!size) WARN.push(`overflow risk (bullets): ${where}`);
  bullets(s, items, x, y, w, h, Object.assign({}, o, { size: size || 20 }));
}
function autoCard(s, x, y, w, h, head, body, where, o = {}) {
  const hl = head ? Math.max(1, Math.ceil(head.length * SZ.body * 0.56 / 72 / (w - (o.num !== undefined ? 1.1 : 0.45)))) : 0;
  const avail = h - (head ? 0.42 * hl + 0.45 : 0.25);
  const plain = Array.isArray(body) ? body : [body || ""];
  const size = fitSize(plain, w - (Array.isArray(body) ? 0.8 : 0.5), avail, o.size || SZ.body, 20, Array.isArray(body) ? 4 : 0);
  if (!size) WARN.push(`overflow risk (card): ${where} / ${head}`);
  card(s, x, y, w, h, head, body, Object.assign({}, o, { size: size || 20 }));
}
function autoCode(s, t, x, y, w, h, where) {
  const lines = t.split("\n"); const longest = Math.max(...lines.map((l) => l.length));
  let size = SZ.code;
  while (size > 18 && (longest * size * 0.6 / 72 > w - 0.3 || lines.length * size * 1.18 / 72 > h - 0.2)) size -= 1;
  if (longest * size * 0.6 / 72 > w - 0.3 || lines.length * size * 1.18 / 72 > h - 0.2) WARN.push(`overflow risk (code): ${where}`);
  code(s, t, x, y, w, h, { size });
}
function sessionDivider(deck, n, extra) {
  const r = SCHED[n];
  const topic = r.topic.split("\n").map((t) => t.trim()).filter(Boolean).join("; ");
  const read = r.task.split("\n").filter((t) => /^(Read|Self-study|Optional|Bring|Install)/.test(t.trim())).join("\n");
  divider(deck, { label: `Session ${n}`, title: topic, read: (read || "") + (extra ? "\n" + extra : "") });
}
function rightPart(s, r, where) {
  const x = 7.2, w = 5.5;
  if (r.card) autoCard(s, x, 1.45, w, r.h || 5.1, r.card[0], r.card[1], where, { fill: r.fill || HEX.paleOrange, num: r.num });
  if (r.code) autoCode(s, r.code, r.x || x, 1.45, r.w || w, r.h || 5.1, where);
  if (r.table) table(s, r.table, r.x || x, 1.45, r.w || w, { colW: r.colW, rowH: r.rowH || 0.55, size: r.size || SZ.table, mono: r.mono });
  if (r.draw) r.draw(s);
}
function renderSlide(deck, sp) {
  const where = sp.h;
  let s;
  switch (sp.k) {
    case "bul": {
      s = content(deck, sp.h, sp.src, sp.notes);
      const w = sp.right ? (sp.leftW || 6.3) : CW;
      autoBullets(s, sp.items, X0, 1.45, w, sp.bottom ? 3.6 : 5.15, where);
      if (sp.right) rightPart(s, sp.right, where);
      if (sp.bottom) autoCard(s, X0, 5.25, CW, 1.4, null, sp.bottom, where, { fill: HEX.paleOrange });
      break;
    }
    case "cards": {
      s = content(deck, sp.h, sp.src, sp.notes);
      const n = sp.cards.length, cols = sp.cols || (n <= 3 ? n : (n === 4 ? 2 : 3)), rows = Math.ceil(n / cols);
      const top = sp.intro ? 2.2 : 1.45, bottomSpace = sp.note ? 1.55 : 0;
      if (sp.intro) autoBullets(s, [sp.intro], X0, 1.45, CW, 0.7, where, { nobullet: true });
      const gw = 0.25, cw = (CW - gw * (cols - 1)) / cols, ch = (6.65 - top - bottomSpace - 0.2 * (rows - 1)) / rows;
      sp.cards.forEach((c, i) => autoCard(s, X0 + (i % cols) * (cw + gw), top + Math.floor(i / cols) * (ch + 0.2), cw, ch, c[0], c[1], where,
        { num: sp.num === false ? undefined : i + 1, fill: c[2] || HEX.pale, headColor: c[3] }));
      if (sp.note) { s.addShape("roundRect", { x: X0, y: 6.65 - 1.35, w: CW, h: 1.35, fill: { color: HEX.navy }, line: { color: HEX.navy }, rectRadius: 0.08 });
        text(s, sp.note, X0 + 0.3, 6.65 - 1.35, CW - 0.6, 1.35, { color: HEX.white, bold: true, valign: "middle", fontSize: fitSize([sp.note], CW - 0.6, 1.3) || 20 }); }
      break;
    }
    case "code": {
      s = content(deck, sp.h, sp.src, sp.notes);
      const cw = sp.codeW || 6.4;
      autoCode(s, sp.code, X0, 1.45, cw, sp.codeH || 5.15, where);
      if (sp.items) autoBullets(s, sp.items, X0 + cw + 0.35, 1.45, CW - cw - 0.35, 5.15, where);
      if (sp.card) autoCard(s, X0 + cw + 0.35, 1.45, CW - cw - 0.35, 5.15, sp.card[0], sp.card[1], where, { fill: HEX.paleOrange });
      break;
    }
    case "table": {
      s = content(deck, sp.h, sp.src, sp.notes);
      if (sp.intro) autoBullets(s, [sp.intro], X0, 1.45, CW, 0.75, where, { nobullet: true });
      const y = sp.intro ? 2.3 : 1.45;
      table(s, sp.rows, X0, y, sp.w || CW, { colW: sp.colW, rowH: sp.rowH || 0.62, size: sp.size || SZ.table, mono: sp.mono });
      const th = sp.rows.length * (sp.rowH || 0.62);
      if (sp.right) rightPart(s, sp.right, where);
      if (sp.note) autoCard(s, X0, Math.max(y + th + 0.3, 5.0), CW, 6.65 - Math.max(y + th + 0.3, 5.0), null, sp.note, where, { fill: HEX.paleOrange });
      break;
    }
    case "quick": {
      s = content(deck, sp.h, sp.src, "Answers: " + sp.ans);
      const n = sp.qs.length, gap = 0.2, h = (5.2 - gap * (n - 1)) / n;
      sp.qs.forEach((q, i) => autoCard(s, X0, 1.45 + i * (h + gap), CW, h, null, `${i + 1}.  ${q}`, where, { fill: i % 2 ? HEX.pale : HEX.paleOrange }));
      break;
    }
    case "list": {   // numbered cards in rows (practice, answers)
      s = content(deck, sp.h, sp.src, sp.notes);
      const n = sp.items.length, gap = 0.2, h = (5.2 - gap * (n - 1)) / n;
      sp.items.forEach((q, i) => autoCard(s, X0, 1.45 + i * (h + gap), CW, h, null, `${i + 1}.  ${q}`, where, { fill: sp.fill || (i % 2 ? HEX.pale : HEX.paleOrange) }));
      break;
    }
    case "plan": {
      s = content(deck, sp.h, sp.src, sp.notes);
      const n = sp.rows.length, step = Math.min(1.25, 5.1 / n);
      sp.rows.forEach((r, i) => {
        const y = 1.5 + i * step;
        node(s, r[0], X0, y, 3.2, step - 0.2, { size: 20, fill: r[3] ? HEX.paleOrange : HEX.white });
        text(s, r[1], X0 + 3.5, y, 7.0, step - 0.2, { valign: "middle", fontSize: fitSize([r[1]], 7.0, step - 0.2) || 20 });
        text(s, r[2] || "", X0 + 10.5, y, 1.6, step - 0.2, { valign: "middle", color: HEX.grey, align: "right" });
      });
      break;
    }
    case "cq": {
      const q = CQS[sp.id];
      s = content(deck, `Constructivist question ${sp.id}`, sp.look);
      card(s, X0, 1.45, CW, 1.6, null, null, { fill: HEX.navy });
      s.addText(q.text, { x: X0 + 0.3, y: 1.5, w: CW - 0.6, h: 1.5, fontSize: fitSize([q.text], CW - 0.6, 1.45, 26) || 22, color: HEX.white, italic: true, valign: "middle", isTextBox: true, margin: 0 });
      text(s, "Discussion prompts", X0, 3.3, CW, 0.5, { bold: true, color: HEX.orange });
      autoBullets(s, sp.prompts, X0, 3.8, CW, 2.05, where, { gap: 4, size: 22 });
      card(s, X0, 5.95, CW, 0.8, null, "Your answer: 150–200 words, using the textbook; submit on the LMS within one week.", { fill: HEX.paleOrange, size: 22 });
      break;
    }
    case "draw": {
      s = content(deck, sp.h, sp.src, sp.notes);
      sp.draw(s);
      break;
    }
    default: throw new Error("unknown slide kind " + sp.k);
  }
  return s;
}
function renderChapter(deck, ch) {
  section(deck, `Chapter ${ch.n}`);
  cover(deck, { course: "IDB201 – Introduction to Databases", chapter: `Chapter ${ch.n}`, title: ch.title,
    sessions: "Sessions " + ch.sessions.map((x) => x.n).join(", ").replace(/, (\d+)$/, " and $1"),
    textbook: "Main textbook: Silberschatz, Korth and Sudarshan, Database System Concepts, 7th ed., McGraw-Hill, 2020 (DSC).\n" + ch.textbook });
  // roadmap
  let s = content(deck, `Chapter ${ch.n} roadmap`, "Schedule of the IDB201 syllabus");
  const n = ch.sessions.length, step = Math.min(1.05, 5.0 / n);
  ch.sessions.forEach((ss, i) => {
    const y = 1.45 + i * step;
    s.addShape("roundRect", { x: X0, y, w: 1.6, h: step - 0.16, fill: { color: HEX.navy }, line: { color: HEX.navy }, rectRadius: 0.08 });
    text(s, "Session " + ss.n, X0, y, 1.6, step - 0.16, { fontSize: 20, bold: true, color: HEX.white, align: "center", valign: "middle" });
    text(s, ss.name, X0 + 1.85, y, 4.0, step - 0.16, { bold: true, color: HEX.navy, valign: "middle", fontSize: fitSize([ss.name], 4.0, step - 0.16) || 20 });
    text(s, ss.sum, X0 + 6.0, y, 6.1, step - 0.16, { valign: "middle", fontSize: fitSize([ss.sum], 6.1, step - 0.16, 22) || 20 });
  });
  if (ch.roadNote) text(s, ch.roadNote, X0, 6.4, CW, 0.4, { fontSize: SZ.caption, color: HEX.orange, bold: true });
  // objectives
  s = content(deck, "Learning objectives", "Course learning outcomes of the IDB201 syllabus: " + ch.clos.join(", "));
  text(s, "After this chapter, you should be able to:", X0, 1.4, CW, 0.5, { italic: true, color: HEX.grey });
  const cloText = ch.clos.map((c) => `${c}: ${CLOS[c]}`).join("\n");
  const cloH = 0.45 + 0.5 * ch.clos.length;
  autoBullets(s, ch.objectives, X0, 1.95, CW, 6.65 - 1.95 - cloH - 0.15, "objectives", { gap: 3 });
  s.addShape("roundRect", { x: X0, y: 6.65 - cloH, w: CW, h: cloH, fill: { color: HEX.pale }, line: { color: HEX.pale }, rectRadius: 0.08 });
  text(s, cloText, X0 + 0.25, 6.65 - cloH + 0.08, CW - 0.5, cloH - 0.16, { fontSize: fitSize(ch.clos.map((c) => `${c}: ${CLOS[c]}`), CW - 0.5, cloH - 0.16, 20, 18, 0) || 18, valign: "middle" });
  for (const ex of ch.front || []) renderSlide(deck, ex);
  for (const ss of ch.sessions) {
    section(deck, `Session ${ss.n}`);
    sessionDivider(deck, ss.n, ss.extra);
    for (const sp of ss.slides) renderSlide(deck, sp);
  }
  for (const sp of ch.back || []) renderSlide(deck, sp);
}
module.exports.renderChapter = renderChapter;
module.exports.renderSlide = renderSlide;
module.exports.WARN = WARN;
module.exports.autoBullets = autoBullets;
module.exports.autoCard = autoCard;
module.exports.autoCode = autoCode;

// relation box for schema diagrams: header + attributes (primary key underlined), 18 pt
function relBox(s, name, attrs, pk, x, y, w, o = {}) {
  const lh = o.lh || 0.32, h = 0.45 + attrs.length * lh + 0.1;
  s.addShape("rect", { x, y, w, h, fill: { color: HEX.white }, line: { color: HEX.navy, width: 1.5 } });
  s.addShape("rect", { x, y, w, h: 0.45, fill: { color: HEX.navy }, line: { color: HEX.navy, width: 1.5 } });
  s.addText(name, { x, y, w, h: 0.45, fontSize: 18, bold: true, color: HEX.white, align: "center", valign: "middle", isTextBox: true, margin: 0 });
  s.addText(attrs.map((a, i) => ({ text: a, options: { underline: pk.includes(a) ? { style: "sng" } : undefined, breakLine: i < attrs.length - 1 } })),
    { x: x + 0.1, y: y + 0.5, w: w - 0.2, h: attrs.length * lh, fontSize: 18, color: HEX.ink, valign: "top", isTextBox: true, margin: 0, lineSpacing: lh * 72 });
  return { x, y, w, h, row: (i) => y + 0.5 + lh * i + lh / 2 };
}
module.exports.relBox = relBox;

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
  s.addText(o.title, { x: 0.6, y: 3.25, w: 12, h: 1.3, fontSize: 44, bold: true, color: HEX.white, isTextBox: true, margin: 0, valign: "top" });
  s.addText(o.sessions, { x: 0.6, y: 4.75, w: 12, h: 0.5, fontSize: 24, color: HEX.white, isTextBox: true, margin: 0 });
  s.addText(o.textbook, { x: 0.6, y: 5.4, w: 12, h: 1.6, fontSize: SZ.caption, color: "D6E0EB", isTextBox: true, margin: 0, valign: "top" });
  if (o.notes) s.addNotes(o.notes);
  return s;
}

function divider(deck, o) {
  const s = deck.pres.addSlide({ masterName: "IDB201 session", sectionTitle: deck.currentSection });
  s.addText(o.label, { x: 0.6, y: 1.7, w: 10, h: 0.7, fontSize: 32, bold: true, color: HEX.orange, isTextBox: true, margin: 0 });
  s.addText(o.title, { x: 0.6, y: 2.45, w: 11.8, h: 1.9, fontSize: 36, bold: true, color: HEX.white, isTextBox: true, margin: 0, valign: "top" });
  s.addText(o.read, { x: 0.6, y: 4.6, w: 11.8, h: 1.9, fontSize: SZ.caption + 2, color: "D6E0EB", isTextBox: true, margin: 0, valign: "top" });
  if (o.notes) s.addNotes(o.notes);
  return s;
}

function content(deck, title, source, notes) {
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
  if (head) { s.addText(head, { x: hx, y: yy, w: w - (hx - x) - 0.2, h: 0.6, fontSize: SZ.body, bold: true, color: o.headColor || HEX.navy, valign: "middle", isTextBox: true, margin: 0 }); yy += 0.7; }
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

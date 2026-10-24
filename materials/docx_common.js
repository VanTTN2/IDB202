// Shared helpers for the IDB201 Word documents (labs, project, tests, question bank).
// Fonts and colors match the slide decks: Cambria headings, Calibri body,
// Courier New code; primary 1F3B4D, accent C8553D.
const path = require("path");
const fs = require("fs");
const docx = require(path.join(__dirname, "node_modules", "docx"));
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, BorderStyle, AlignmentType, HeadingLevel, LevelFormat, Header,
  Footer, PageNumber, TabStopType,
} = docx;

const C = { primary: "1F3B4D", accent: "C8553D", muted: "5B6770", light: "EAF0F2", code: "F4F6F7", rule: "C9D3D8" };
const PAGE_W = 11906, MARGIN = 1134;               // A4, 2 cm margins
const TEXT_W = PAGE_W - 2 * MARGIN;                 // 9638 DXA

// Inline markup: **bold**, `code`, _italic_
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g;
  let last = 0, m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith("**")) out.push(new TextRun({ text: t.slice(2, -2), bold: true, ...base }));
    else if (t.startsWith("`")) out.push(new TextRun({ text: t.slice(1, -1), font: "Courier New", size: 19, ...base }));
    else out.push(new TextRun({ text: t.slice(1, -1), italics: true, ...base }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}

const P = (text, o = {}) => new Paragraph({ children: runs(text, o.run || {}), spacing: { after: 100 }, alignment: o.align, keepNext: o.keepNext });
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
const bullets = (items, level = 0) => items.flatMap((it) => Array.isArray(it)
  ? bullets(it, level + 1)
  : [new Paragraph({ numbering: { reference: "bullets", level }, children: runs(it), spacing: { after: 60 } })]);
let numInstance = 0;
const numbered = (items) => { const inst = ++numInstance; return items.map((it) => new Paragraph({ numbering: { reference: "numbers", level: 0, instance: inst }, children: runs(it), spacing: { after: 60 } })); };
const code = (text) => text.split("\n").map((line, i, a) => new Paragraph({
  children: [new TextRun({ text: line.length ? line : " ", font: "Courier New", size: 18 })],
  shading: { type: ShadingType.CLEAR, fill: C.code, color: "auto" },
  spacing: { before: i === 0 ? 60 : 0, after: i === a.length - 1 ? 120 : 0, line: 240 },
  indent: { left: 113, right: 113 },
}));

const border = { style: BorderStyle.SINGLE, size: 4, color: C.rule };
const borders = { top: border, bottom: border, left: border, right: border };
function cell(content, width, o = {}) {
  const paras = (Array.isArray(content) ? content : [content]).map((c) =>
    typeof c === "string" ? new Paragraph({ children: runs(c, o.head ? { bold: true, color: "FFFFFF" } : {}), spacing: { after: 40 } }) : c);
  return new TableCell({
    children: paras, width: { size: width, type: WidthType.DXA }, borders,
    shading: o.head ? { type: ShadingType.CLEAR, fill: C.primary, color: "auto" } : (o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: "auto" } : undefined),
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
  });
}
// widths: relative numbers, scaled to the text width
function table(widths, head, rows, o = {}) {
  const total = widths.reduce((a, b) => a + b, 0);
  const w = widths.map((x) => Math.floor((x / total) * TEXT_W));
  w[w.length - 1] += TEXT_W - w.reduce((a, b) => a + b, 0);
  const trs = [];
  if (head) trs.push(new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, w[i], { head: true })) }));
  rows.forEach((r, k) => trs.push(new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, w[i], { fill: (o.shadeTotal && k === rows.length - 1) ? C.light : undefined })) })));
  return [new Table({ width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: w, rows: trs }), new Paragraph({ spacing: { after: 80 }, children: [] })];
}
// A shaded box with a bold label, used for notes and hints
function box(label, lines) {
  const w = TEXT_W;
  const paras = [new Paragraph({ children: [new TextRun({ text: label, bold: true, color: C.accent })], spacing: { after: 60 } }),
    ...lines.map((l) => new Paragraph({ children: runs(l), spacing: { after: 60 } }))];
  return [new Table({ width: { size: w, type: WidthType.DXA }, columnWidths: [w], rows: [new TableRow({ children: [new TableCell({ children: paras, width: { size: w, type: WidthType.DXA }, borders: { top: border, bottom: border, right: border, left: { style: BorderStyle.SINGLE, size: 24, color: C.accent } }, shading: { type: ShadingType.CLEAR, fill: C.light, color: "auto" }, margins: { top: 100, bottom: 100, left: 160, right: 160 } })] })] }),
    new Paragraph({ spacing: { after: 80 }, children: [] })];
}

function titleBlock(title, subtitle, meta) {
  const out = [
    new Paragraph({ children: [new TextRun({ text: "IDB201 – Introduction to Databases", font: "Cambria", size: 22, color: C.muted })], spacing: { after: 60 } }),
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(title)] }),
  ];
  if (subtitle) out.push(new Paragraph({ children: [new TextRun({ text: subtitle, font: "Cambria", size: 26, italics: true, color: C.primary })], spacing: { after: 160 } }));
  if (meta) out.push(...table([1, 3], null, meta.map(([k, v]) => [`**${k}**`, v])));
  return out;
}

function build(file, children, o = {}) {
  const doc = new Document({
    creator: "IDB201 course team", title: o.title || "IDB201",
    styles: {
      default: { document: { run: { font: "Calibri", size: 21 } } },
      paragraphStyles: [
        { id: "Title", name: "Title", basedOn: "Normal", run: { font: "Cambria", size: 40, bold: true, color: C.primary }, paragraph: { spacing: { after: 80 } } },
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Cambria", size: 28, bold: true, color: C.primary }, paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 0, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.rule, space: 2 } } } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Cambria", size: 24, bold: true, color: C.primary }, paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 1, keepNext: true } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Cambria", size: 22, bold: true, color: C.accent }, paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2, keepNext: true } },
      ],
    },
    numbering: { config: [
      { reference: "bullets", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 240 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 240 } } } },
      ] },
      { reference: "numbers", levels: [
        { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } } } },
      ] },
    ] },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
      headers: { default: new Header({ children: [new Paragraph({ children: [new TextRun({ text: o.header || "IDB201 – Introduction to Databases", size: 16, color: C.muted })], alignment: AlignmentType.RIGHT })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ["Page ", PageNumber.CURRENT, " of ", PageNumber.TOTAL_PAGES], size: 16, color: C.muted })] })] }) },
      children,
    }],
  });
  return Packer.toBuffer(doc).then((buf) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, buf); console.log("Saved " + file); });
}

module.exports = { docx, C, TEXT_W, runs, P, H1, H2, H3, bullets, numbered, code, table, box, titleBlock, build };

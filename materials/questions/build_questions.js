// Builds the progress tests (PT1, PT2) and the final-exam question bank (400 MCQ).
// Usage: node materials/questions/build_questions.js
// In the source files the first option of each item is the key; options are shuffled here with a
// fixed seed per item, so every build gives the same documents.
const path = require("path");
const { docx, P, H1, H2, H3, bullets, code, table, box, titleBlock, build } = require(path.join(__dirname, "..", "docx_common.js"));
const { Paragraph, TextRun, PageBreak } = docx;

const LEVEL = { R: "Remember", U: "Understand", Ap: "Apply", An: "Analyze" };
const CLO = { 1: "CLO1", 2: "CLO3", 3: "CLO4", 4: "CLO4", 5: "CLO4", 6: "CLO2", 7: "CLO5", 8: "CLO6", 9: "CLO6", 10: "CLO7" };
const CH_TITLE = {
  1: "Introduction to database systems", 2: "The relational model and relational algebra", 3: "Introduction to SQL",
  4: "Intermediate SQL", 5: "Programming the database (T-SQL)", 6: "Database design using the E-R model",
  7: "Relational database design", 8: "Storage and indexing", 9: "Query processing and optimization",
  10: "Transactions, concurrency control and recovery",
};

function hash(str) { let h = 2166136261; for (const ch of str) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let KEYS_USED = [0, 0, 0, 0];
const isNum = (x) => /^-?[0-9][0-9,.]*$/.test(x.trim());

function prepare(q, id) {
  if (q.o.length !== 4) throw new Error(`${id}: needs 4 options`);
  if (new Set(q.o).size !== 4) throw new Error(`${id}: duplicate options`);
  let order = [0, 1, 2, 3];
  if (q.o.every(isNum)) order.sort((a, b) => parseFloat(q.o[a].replace(/,/g, "")) - parseFloat(q.o[b].replace(/,/g, "")));
  else if (!q.k) {
    // shuffle, then move the key to the least-used position so far (balanced keys)
    const r = rng(hash(id + q.s));
    for (let i = 3; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const min = Math.min(...KEYS_USED);
    const cand = [0, 1, 2, 3].filter((p) => KEYS_USED[p] === min);
    const target = cand[Math.floor(r() * cand.length)], cur = order.indexOf(0);
    [order[cur], order[target]] = [order[target], order[cur]];
  }
  KEYS_USED[order.indexOf(0)]++;
  const opts = order.map((i) => q.o[i]);
  return { ...q, id, opts, key: "ABCD"[order.indexOf(0)], ref: q.ref.replace(/§(\d+\.\d+)\.\d+/g, "§$1") };
}

function questionParas(q, n, withKey, chap) {
  const out = [new Paragraph({ keepNext: true, spacing: { before: 160, after: 60 }, children: [new TextRun({ text: `${n}. `, bold: true }), new TextRun(q.s)] })];
  if (q.c) out.push(...code(q.c));
  q.opts.forEach((o, i) => out.push(new Paragraph({ keepNext: withKey || i < 3, indent: { left: 360 }, spacing: { after: 20 }, children: [new TextRun({ text: `${"ABCD"[i]}. `, bold: true }), new TextRun(o)] })));
  if (withKey) {
    const meta = [`Chapter ${chap}`, q.clo || CLO[chap], LEVEL[q.l], q.t === "P" ? "Practice" : "Theory"];
    if (q.ss) meta.push("Self-study");
    out.push(new Paragraph({ spacing: { before: 40, after: 60 }, indent: { left: 360 }, children: [
      new TextRun({ text: `Answer: ${q.key}`, bold: true, color: "C8553D" }),
      new TextRun({ text: `   ·   ${meta.join(" · ")}   ·   DSC ${q.ref}`, size: 18, color: "5B6770" }),
    ] }));
  }
  return out;
}

function stats(items) {
  const lv = { R: 0, U: 0, Ap: 0, An: 0 }; let ss = 0, pr = 0;
  items.forEach((q) => { lv[q.l]++; if (q.ss) ss++; if (q.t === "P") pr++; });
  return { lv, ss, pr, n: items.length };
}
const pct = (a, n) => `${a} (${Math.round((100 * a) / n)}%)`;

// ---------------------------------------------------------------- progress tests
function progressTest(no, file, items, meta) {
  KEYS_USED = [0, 0, 0, 0];
  const qs = items.map((q, i) => ({ ...prepare(q, `PT${no}-${i + 1}`), ch: q.ch }));
  const st = stats(qs);
  const children = [
    ...titleBlock(`Progress test ${no}`, meta.subtitle, [
      ["Session", meta.session], ["Duration", "30 minutes"], ["Coverage", meta.coverage],
      ["Format", "20 multiple-choice questions; one correct answer per question; 0.5 point each (10 points in total)"],
      ["Weight", "5% of the course grade"], ["CLOs", meta.clos],
    ]),
    ...box("Instructions", ["Choose the single best answer for each question. No books, notes or devices are allowed. In the code fragments, SQL keywords are written in lower case as in the textbook."]),
    H1("Questions"),
    ...qs.flatMap((q, i) => questionParas(q, i + 1, false, q.ch)),
    new Paragraph({ children: [new PageBreak()] }),
    H1("Answer key (lecturer copy)"),
    P("Remove this page before printing the test for students."),
    ...table([0.6, 0.7, 0.9, 1.3, 1.1, 1.0, 2.4], ["Q", "Key", "Chapter", "Level", "Type", "Self-study", "Source"],
      qs.map((q, i) => [String(i + 1), `**${q.key}**`, String(q.ch), LEVEL[q.l], q.t === "P" ? "Practice" : "Theory", q.ss ? "yes" : "", `DSC ${q.ref}`])),
    P(`Composition: Remember ${st.lv.R}, Understand ${st.lv.U}, Apply ${st.lv.Ap}, Analyze ${st.lv.An}; practice-based ${st.pr}; self-study ${st.ss}.`),
  ];
  return build(path.join(__dirname, "out", file), children, { title: `IDB201 Progress test ${no}`, header: `IDB201 – Progress test ${no}` }).then(() => st);
}

// ---------------------------------------------------------------- final-exam bank
function bank() {
  KEYS_USED = [0, 0, 0, 0];
  const chapters = [];
  for (let c = 1; c <= 10; c++) {
    const src = require(path.join(__dirname, "bank", `ch${c}.js`));
    chapters.push({ c, items: src.map((q, i) => prepare(q, `C${c}-${i + 1}`)) });
  }
  const all = chapters.flatMap((x) => x.items);
  const st = stats(all);
  const keyDist = { A: 0, B: 0, C: 0, D: 0 }; all.forEach((q) => keyDist[q.key]++);
  const rows = chapters.map(({ c, items }) => { const s = stats(items); return [`${c}. ${CH_TITLE[c]}`, String(s.n), String(s.lv.R), String(s.lv.U), String(s.lv.Ap), String(s.lv.An), String(s.pr), String(s.ss)]; });
  rows.push(["**Total**", `**${st.n}**`, `**${st.lv.R}**`, `**${st.lv.U}**`, `**${st.lv.Ap}**`, `**${st.lv.An}**`, `**${st.pr}**`, `**${st.ss}**`]);
  let n = 0;
  const children = [
    ...titleBlock("Final examination: question bank", "400 multiple-choice questions with answer keys (lecturer copy)", [
      ["Exam format", "50 multiple-choice questions, 60 minutes, marked by computer; 50% of the course grade; minimum 5/10"],
      ["Coverage", "All chapters, including the self-study readings"], ["CLOs", "CLO1–CLO7"],
      ["Composition", `${st.n} questions: Remember ${pct(st.lv.R, st.n)}, Understand ${pct(st.lv.U, st.n)}, Apply ${pct(st.lv.Ap, st.n)}, Analyze ${pct(st.lv.An, st.n)}; practice-based ${pct(st.pr, st.n)}; self-study ${pct(st.ss, st.n)}`],
      ["Answer keys", `A ${keyDist.A}, B ${keyDist.B}, C ${keyDist.C}, D ${keyDist.D}`],
    ]),
    H1("How to compose an exam form"),
    ...bullets([
      "Draw 50 questions in proportion to the chapters (about 5 per chapter).",
      "At least 15 questions (30%) at the Analyze level, as required by the Grading structure.",
      "About 10 questions (20%) on self-study readings; the bank marks them 'Self-study'.",
      "Change at least 70% of the questions with respect to the previous exam form.",
      "Every question has four options and one correct answer. There are no true/false items.",
      "Each question gives its source in DSC (7th ed.) by section, or the course session for content not taken from DSC (T-SQL specifics, extended algebra operators).",
    ]),
    H2("Distribution by chapter and level"),
    ...table([3.6, 0.8, 0.9, 1.1, 0.8, 0.9, 0.9, 1.0], ["Chapter", "Items", "Remember", "Understand", "Apply", "Analyze", "Practice", "Self-study"], rows, { shadeTotal: true }),
    ...chapters.flatMap(({ c, items }) => [
      new Paragraph({ children: [new PageBreak()] }),
      H1(`Chapter ${c}. ${CH_TITLE[c]}`),
      ...items.flatMap((q) => questionParas(q, ++n, true, c)),
    ]),
  ];
  return build(path.join(__dirname, "out", "IDB201_Final_Exam_Question_Bank.docx"), children, { title: "IDB201 Final exam question bank", header: "IDB201 – Final exam question bank (lecturer copy)" }).then(() => ({ st, keyDist }));
}

(async () => {
  const p1 = await progressTest(1, "IDB201_Progress_Test_1.docx", require("./tests/pt1.js"), {
    subtitle: "Chapters 1–5 and their self-study readings", session: "26", clos: "CLO1, CLO2, CLO3, CLO4",
    coverage: "Chapters 1–5 (DSC Ch. 1–4, §5.1–5.4, §5.5) including the self-study readings (relational calculus, bag semantics, §4.7, §5.5, §9.8) and the constructivist questions CQ1–CQ4",
  });
  const p2 = await progressTest(2, "IDB201_Progress_Test_2.docx", require("./tests/pt2.js"), {
    subtitle: "Chapters 6–7 and their self-study readings", session: "40", clos: "CLO2, CLO5",
    coverage: "Chapters 6–7 (DSC Ch. 6–7) including the self-study sections (§6.8, §6.10–6.11, §7.7, §7.9) and the constructivist questions CQ6–CQ7",
  });
  const b = await bank();
  console.log("PT1", JSON.stringify(p1)); console.log("PT2", JSON.stringify(p2)); console.log("Bank", JSON.stringify(b));
})();

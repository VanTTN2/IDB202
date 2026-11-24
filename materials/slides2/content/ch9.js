// Chapter 9 – Query processing and query optimization (sessions 44–47)
const L = require("../lib");
const { HEX, X0, CW } = L;
const src = (x) => `Source: DSC 7th ed., ${x}`;
const drawn = (x) => `Diagram drawn for IDB201 after DSC 7th ed., ${x}`;
const SQLS = "Microsoft SQL Server 2022 documentation (execution plans; showplan operators)";

// expression tree: node = { t, kids: [] }; drawn top-down, labels >= 18 pt
function etree(s, root, x0, y0, w, o = {}) {
  const dy = o.dy || 0.95, nh = 0.55;
  const leaves = (n) => (n.kids && n.kids.length ? n.kids.reduce((a, k) => a + leaves(k), 0) : 1);
  const total = leaves(root), unit = w / total;
  function draw(n, left, depth) {
    const lw = leaves(n) * unit, cx = left + lw / 2, y = y0 + depth * dy;
    const tw = Math.min(Math.max(0.5 + n.t.length * 0.13, 0.7), lw + 1.2);
    const hl = o.hl && o.hl.includes(n.t);
    s.addShape("roundRect", { x: cx - tw / 2, y, w: tw, h: nh, fill: { color: hl ? HEX.paleOrange : (n.kids && n.kids.length ? HEX.white : HEX.pale) }, line: { color: hl ? HEX.orange : HEX.navy, width: 1.5 }, rectRadius: 0.08 });
    s.addText(n.t, { x: cx - tw / 2, y, w: tw, h: nh, fontSize: 18, bold: true, color: HEX.navy, align: "center", valign: "middle", isTextBox: true, margin: 0 });
    let l = left;
    (n.kids || []).forEach((k) => {
      const kw = leaves(k) * unit, kcx = l + kw / 2;
      L.arrow(s, cx, y + nh, kcx, y + dy, { noHead: true, width: 1.5 });
      draw(k, l, depth + 1); l += kw;
    });
  }
  draw(root, x0, 0);
}
const N = (t, ...kids) => ({ t, kids });
const BEFORE = N("Π name, title", N("σ dept_name = 'Physics'", N("⋈", N("⋈", N("instructor"), N("teaches")), N("Π course_id, title", N("course")))));
const AFTER = N("Π name, title", N("⋈", N("⋈", N("σ dept_name = 'Physics'", N("instructor")), N("teaches")), N("Π course_id, title", N("course"))));

module.exports = {
  n: 9,
  title: "Query processing and query optimization",
  textbook: "DSC Ch. 15, §15.1–15.5, pp. 689–718; Ch. 16, §16.1–16.2, pp. 743–756; self-study §15.6–15.7, §16.3; optional §16.4.",
  clos: ["CLO6"],
  objectives: [
    "Describe the steps of query processing: parsing, optimization and evaluation",
    "Estimate the cost of selections and of external sorting in block transfers and seeks",
    "Compare nested-loop, block nested-loop, indexed nested-loop, merge and hash joins",
    "Apply equivalence rules to transform expression trees",
    "Read an SQL Server execution plan and relate it to the algorithms of the chapter",
  ],
  roadNote: "Session 48: Lab 5 part 1 (indexes and execution plans) · Session 54: Lab 5 part 2",
  sessions: [
    // ------------------------------------------------------------ 44
    { n: 44, name: "Query processing basics", sum: "15.1 overview; 15.2 measures of cost; 15.3 selection; 15.4 external sort-merge",
      slides: [
        { k: "draw", h: "15.1 Steps in query processing", src: drawn("§15.1"), draw: (s) => {
          L.node(s, "SQL query", 0.6, 1.6, 2.3, 0.8, { fill: HEX.pale });
          L.node(s, "Parser and translator", 3.6, 1.6, 3.0, 0.8);
          L.node(s, "Relational-algebra expression", 7.3, 1.6, 3.8, 0.8, { fill: HEX.pale });
          L.node(s, "Optimizer", 7.3, 3.3, 3.8, 0.8, { fill: HEX.paleOrange });
          L.node(s, "Statistics about data", 11.3, 3.3, 1.5, 0.8, { size: 18, fill: HEX.white });
          L.node(s, "Execution plan", 7.3, 5.0, 3.8, 0.8, { fill: HEX.pale });
          L.node(s, "Evaluation engine", 3.6, 5.0, 3.0, 0.8);
          L.node(s, "Query output", 0.6, 5.0, 2.3, 0.8, { fill: HEX.pale });
          L.node(s, "Data", 3.6, 3.4, 3.0, 0.7, { size: 18, fill: HEX.white });
          L.arrow(s, 2.9, 2.0, 3.6, 2.0); L.arrow(s, 6.6, 2.0, 7.3, 2.0); L.arrow(s, 9.2, 2.4, 9.2, 3.3); L.arrow(s, 11.3, 3.7, 11.1, 3.7);
          L.arrow(s, 9.2, 4.1, 9.2, 5.0); L.arrow(s, 7.3, 5.4, 6.6, 5.4); L.arrow(s, 3.6, 5.4, 2.9, 5.4); L.arrow(s, 5.1, 4.1, 5.1, 5.0);
          L.text(s, "1 parse and translate · 2 optimize · 3 evaluate", X0, 6.1, CW, 0.5, { fontSize: 20, color: HEX.grey, align: "center" });
        } },
        { k: "bul", h: "15.1 Evaluation plans", src: src("§15.1"), items: [
          "One query has many equivalent relational-algebra expressions",
          "Each operation can be evaluated by several algorithms",
          "An evaluation plan fixes both: the expression and an algorithm (and index) for every operation",
          "Example: σ salary < 75000 (instructor) by a scan, or by an index on salary",
          "The optimizer chooses a plan with low estimated cost"],
          right: { draw: (s) => {
            etree(s, N("Π name", N("σ salary < 75000", N("instructor"))), 7.3, 1.6, 5.3);
            L.text(s, "Annotate σ with “use the B+-tree index on salary”: the annotated tree is an evaluation plan", 7.3, 4.6, 5.3, 1.0, { fontSize: 20, color: HEX.grey, align: "center" });
          } } },
        { k: "cards", h: "15.2 Measures of query cost", src: src("§15.2"), cards: [
          ["Transfers", "b blocks read or written; each costs tT, about 0.1 ms"],
          ["Seeks", "S random accesses; each costs tS, about 4 ms on a magnetic disk"],
          ["Cost", "b · tT + S · tS; CPU and writing the final result are ignored", HEX.paleOrange]],
          note: "Unless stated otherwise, estimates assume the worst case: little memory for buffering." },
        { k: "table", h: "Notation used in Chapter 9", src: src("§15.2–15.5"), size: 22, rowH: 0.72, colW: [2.5, 9.63], rows: [
          ["Symbol", "Meaning"],
          ["nr", "Number of tuples of relation r"],
          ["br", "Number of blocks containing tuples of r"],
          ["hi", "Height of index i (nodes read from root to leaf)"],
          ["M", "Number of memory blocks available to the operation"],
          ["tT, tS", "Time for one block transfer, one seek"]] },
        { k: "table", h: "15.3 Selection algorithms (main cases)", src: src("§15.3.1"), size: 20, rowH: 0.7, colW: [4.1, 3.3, 4.73], rows: [
          ["Algorithm", "Condition", "Cost"],
          ["A1 linear search", "any", "tS + br · tT"],
          ["A1, equality on a key", "stop at first match", "tS + (br / 2) · tT on average"],
          ["A2 clustering index, key", "equality", "(hi + 1) · (tT + tS)"],
          ["A3 clustering index, non-key", "equality, b blocks match", "hi · (tT + tS) + tS + b · tT"],
          ["A4 secondary index, key", "equality", "(hi + 1) · (tT + tS)"],
          ["A4 secondary index, non-key", "equality, n records match", "(hi + n) · (tT + tS)"]] },
        { k: "table", h: "Selection costs: a worked example", src: "Example written for IDB201; formulas of DSC 7th ed., §15.3 (tT = 0.1 ms, tS = 4 ms)", size: 20, rowH: 0.72, colW: [4.4, 4.3, 3.43],
          intro: "r has br = 500 blocks; B+-tree indices of height 3. The condition matches 200 records.",
          rows: [
          ["Plan", "Formula", "Time"],
          ["A1 linear scan", "4 + 500 · 0.1", "54 ms"],
          ["A2 clustering index, key (1 record)", "(3 + 1) · 4.1", "16.4 ms"],
          ["A4 secondary index, 200 records", "(3 + 200) · 4.1", "832.3 ms"]],
          note: "Each of the 200 records may lie in a different block: one seek each. Here the scan is 15 times faster." },
        { k: "bul", h: "15.3 Comparisons and complex selections", src: src("§15.3.2–15.3.3"), items: [
          "A ≥ v with a clustering index: find v, then scan the file in order",
          "A ≤ v: scan from the start, no index needed",
          "Conjunction: use the most selective index, test the rest in memory, or intersect record-pointer sets",
          "Disjunction: union of pointer sets, only if every condition has an index; otherwise scan",
          "Negation: usually a linear scan"] },
        { k: "draw", h: "15.4 External sort-merge", src: "Example written for IDB201; algorithm of DSC 7th ed., §15.4", draw: (s) => {
          L.text(s, "br = 12 blocks, M = 3 memory blocks", X0, 1.35, CW, 0.45, { fontSize: 20, bold: true, color: HEX.navy });
          L.node(s, "r: 12 blocks, unsorted", 0.6, 2.0, 2.6, 3.9, { fill: HEX.white, size: 18 });
          [0, 1, 2, 3].forEach((i) => { L.node(s, `run ${i + 1}: 3 blocks`, 4.0, 2.0 + i * 1.0, 2.4, 0.8, { size: 18, fill: HEX.pale }); L.arrow(s, 3.2, 3.95, 4.0, 2.4 + i * 1.0, { width: 1.25 }); });
          [0, 1].forEach((i) => { L.node(s, `run: 6 blocks`, 7.3, 2.5 + i * 2.0, 2.2, 0.8, { size: 18, fill: HEX.paleOrange }); L.arrow(s, 6.4, 2.4 + i * 2.0, 7.3, 2.9 + i * 2.0, { width: 1.25 }); L.arrow(s, 6.4, 3.4 + i * 2.0, 7.3, 2.9 + i * 2.0, { width: 1.25 }); });
          L.node(s, "sorted r: 12 blocks", 10.4, 3.5, 2.3, 0.8, { size: 18, fill: HEX.white });
          L.arrow(s, 9.5, 2.9, 10.4, 3.9, { width: 1.25 }); L.arrow(s, 9.5, 4.9, 10.4, 3.9, { width: 1.25 });
          L.text(s, "stage 1: sort M blocks at a time", 3.4, 6.1, 3.6, 0.5, { fontSize: 18, color: HEX.grey });
          L.text(s, "stage 2: merge M − 1 = 2 runs at a time, 2 passes", 7.2, 6.1, 5.5, 0.5, { fontSize: 18, color: HEX.grey });
        } },
        { k: "code", h: "15.4 The algorithm and its cost", src: src("§15.4"), codeW: 6.6, code:
"-- stage 1: create sorted runs\nrepeat\n  read M blocks of r;\n  sort them in memory;\n  write them as run Ri;\nuntil the end of r;\n\n-- stage 2: merge\n-- merge M - 1 runs at a time\n-- (one block for output)\n-- until one run remains",
          card: ["Cost", ["Runs: ⌈br / M⌉", "Merge passes: ⌈log(M−1)(br / M)⌉", "Transfers: br (2 ⌈log(M−1)(br / M)⌉ + 1), final write not counted", "Example: 12 (2 · 2 + 1) = 60"]] },
        { k: "cards", h: "Why sorting matters", src: src("§15.4"), cards: [
          ["order by", "The result must be sorted"],
          ["Merge join", "Both inputs sorted on the join attributes (session 45)"],
          ["Duplicates and grouping", "distinct, group by and union can be done by sorting"]],
          note: "br = 10,000, M = 101: 100 runs, one merge pass, 30,000 block transfers. Memory decides the number of passes." },
        { k: "quick", h: "Quick check: session 44", src: "Questions written for IDB201 on DSC 7th ed., §15.1–15.4",
          qs: ["Why does the simple cost model ignore CPU time?",
               "When is a linear scan cheaper than a secondary index on a non-key attribute?",
               "br = 1,000 and M = 11. How many runs and merge passes does external sort-merge need?"],
          ans: "1 disk access is slower by orders of magnitude, so it dominates; 2 when many records match: one seek per record exceeds one pass over the file; 3 ⌈1000/11⌉ = 91 runs, ⌈log10 91⌉ = 2 passes." },
      ] },
    // ------------------------------------------------------------ 45
    { n: 45, name: "Join algorithms", sum: "15.5 nested-loop, block nested-loop, indexed nested-loop, merge and hash join; cost comparison",
      slides: [
        { k: "table", h: "The running example of DSC", src: src("§15.5"), size: 22, rowH: 0.8, colW: [3.5, 4.3, 4.33],
          intro: "student ⋈ takes on ID; takes.ID is a foreign key to student.",
          rows: [
          ["Relation", "Tuples", "Blocks"],
          ["student", "n = 5,000", "b = 100"],
          ["takes", "n = 10,000", "b = 400"]],
          note: "All costs below are block transfers in this example; seeks are given only where they decide the choice." },
        { k: "code", h: "Nested-loop join", src: src("§15.5.1"), codeW: 6.8, code:
"for each tuple tr in r do\n  for each tuple ts in s do\n    if (tr, ts) satisfies θ then\n      add tr · ts to the result;",
          card: ["Cost, worst case", ["nr · bs + br transfers, nr + br seeks", "Works for any join condition θ", "student outer: 5,000 · 400 + 100 = 2,000,100", "takes outer: 10,000 · 100 + 400 = 1,000,400"]] },
        { k: "code", h: "Block nested-loop join", src: src("§15.5.2"), codeW: 6.8, code:
"for each block Br of r do\n  for each block Bs of s do\n    for each tuple tr in Br do\n      for each tuple ts in Bs do\n        if (tr, ts) satisfies θ then\n          add tr · ts to the result;",
          card: ["Cost", ["Worst case: br · bs + br transfers, 2 · br seeks", "student outer: 100 · 400 + 100 = 40,100", "With M blocks: ⌈br / (M − 2)⌉ · bs + br", "Smaller relation fits in memory: br + bs = 500"]] },
        { k: "draw", h: "Why blocking helps", src: drawn("§15.5.1–15.5.2"), draw: (s) => {
          [["Nested loop", "s is read once for every tuple of r", "5,000 scans of takes"], ["Block nested loop", "s is read once for every block of r", "100 scans of takes"], ["… with M − 2 blocks for r", "s is read once per chunk of M − 2 blocks", "⌈100 / (M − 2)⌉ scans"]].forEach((r, i) => {
            const y = 1.55 + i * 1.6;
            L.node(s, r[0], 0.6, y, 3.6, 1.0, { fill: i === 2 ? HEX.paleOrange : HEX.pale, size: 20 });
            L.arrow(s, 4.2, y + 0.5, 5.0, y + 0.5);
            L.text(s, r[1], 5.1, y, 4.6, 1.0, { fontSize: 22, valign: "middle" });
            L.text(s, r[2], 9.8, y, 2.9, 1.0, { fontSize: 22, bold: true, color: HEX.orange, valign: "middle" });
          });
          L.text(s, "Use the smaller relation as the outer one, and give it as much memory as possible.", X0, 6.0, CW, 0.55, { fontSize: 20, color: HEX.grey });
        } },
        { k: "bul", h: "Indexed nested-loop join", src: src("§15.5.3"), items: [
          "For each tuple of the outer relation r, look up the matching tuples of s with an index on the join attribute",
          "Cost: br · (tT + tS) + nr · c, where c is the cost of one lookup",
          "Example: student outer, B+-tree on takes(ID) with 4 levels: each lookup reads 4 index nodes and 1 data block",
          "100 + 5,000 · 5 = 25,100 block transfers"],
          bottom: "Best when the outer relation is small, e.g. after a selective condition." },
        { k: "draw", h: "Merge join", src: "Example on the course database University (givenDB); algorithm of DSC 7th ed., §15.5.4", draw: (s) => {
          const st = ["S0001 An", "S0002 Binh", "S0003 Chau", "S0004 Dung"], tk = ["S0001 CS-101", "S0001 CS-201", "S0002 CS-101", "S0002 CS-201", "S0003 CS-101"];
          L.text(s, "student, sorted by ID", 0.8, 1.4, 3.6, 0.45, { fontSize: 18, bold: true, color: HEX.navy });
          L.text(s, "takes, sorted by ID", 6.0, 1.4, 3.8, 0.45, { fontSize: 18, bold: true, color: HEX.navy });
          st.forEach((r, i) => { s.addShape("rect", { x: 0.8, y: 1.9 + i * 0.55, w: 3.0, h: 0.55, fill: { color: i === 1 ? HEX.paleOrange : HEX.white }, line: { color: HEX.navy, width: 1.25 } }); L.text(s, r, 0.9, 1.9 + i * 0.55, 2.8, 0.55, { fontSize: 18, valign: "middle", fontFace: "Courier New" }); });
          tk.forEach((r, i) => { s.addShape("rect", { x: 6.0, y: 1.9 + i * 0.55, w: 3.4, h: 0.55, fill: { color: i === 2 || i === 3 ? HEX.paleOrange : HEX.white }, line: { color: HEX.navy, width: 1.25 } }); L.text(s, r, 6.1, 1.9 + i * 0.55, 3.2, 0.55, { fontSize: 18, valign: "middle", fontFace: "Courier New" }); });
          L.arrow(s, 3.8, 2.72, 6.0, 3.0, { color: HEX.orange }); L.arrow(s, 3.8, 2.72, 6.0, 3.55, { color: HEX.orange });
          L.text(s, "pr", 0.25, 2.5, 0.5, 0.45, { fontSize: 18, bold: true, color: HEX.orange }); L.text(s, "ps", 9.5, 2.85, 0.5, 0.45, { fontSize: 18, bold: true, color: HEX.orange });
          L.autoCard(s, 10.0, 1.4, 2.7, 4.6, "Idea", "Advance the pointer with the smaller ID; join the groups with equal IDs. Dung (S0004) has no takes row: no output.", "mj", { fill: HEX.pale, size: 18 });
          L.text(s, "takes abbreviated: at most two rows per student are shown.", 0.8, 5.0, 9.0, 0.45, { fontSize: 18, color: HEX.grey, italic: true });
          L.text(s, "Cost once sorted: br + bs = 500 transfers; each block is read once.", 0.8, 5.6, 9.0, 0.5, { fontSize: 20, color: HEX.ink });
        } },
        { k: "bul", h: "Merge join: conditions and cost", src: src("§15.5.4"), items: [
          "Only for equi-joins and natural joins",
          "Both inputs must be sorted on the join attributes; if not, add the cost of sorting (session 44)",
          "Each block is read once: br + bs transfers, if every group of equal values fits in memory",
          "Useful when the inputs are already sorted, e.g. read through clustered indices"] },
        { k: "draw", h: "Hash join", src: drawn("§15.5.5"), draw: (s) => {
          L.node(s, "r (build)", 0.6, 1.6, 2.2, 0.8, { fill: HEX.pale }); L.node(s, "s (probe)", 0.6, 4.4, 2.2, 0.8, { fill: HEX.pale });
          [0, 1, 2, 3].forEach((i) => {
            L.node(s, `r${i}`, 4.0 + i * 1.15, 1.6, 0.95, 0.8, { size: 18, fill: HEX.paleOrange }); L.node(s, `s${i}`, 4.0 + i * 1.15, 4.4, 0.95, 0.8, { size: 18, fill: HEX.white });
            L.arrow(s, 4.47 + i * 1.15, 2.4, 4.47 + i * 1.15, 4.4, { noHead: true, dash: "dash", width: 1.5, color: HEX.orange });
          });
          L.arrow(s, 2.8, 2.0, 4.0, 2.0); L.arrow(s, 2.8, 4.8, 4.0, 4.8);
          L.text(s, "h(ID)", 2.85, 1.55, 1.1, 0.4, { fontSize: 18, color: HEX.navy, bold: true }); L.text(s, "h(ID)", 2.85, 4.35, 1.1, 0.4, { fontSize: 18, color: HEX.navy, bold: true });
          L.text(s, "only ri and si can match", 4.0, 3.15, 4.5, 0.45, { fontSize: 18, color: HEX.orange, bold: true });
          L.autoCard(s, 9.0, 1.6, 3.7, 4.5, "Steps", ["Partition both inputs with the same hash function h", "For each i: build an in-memory hash table on ri", "Probe it with each tuple of si"], "hj", { fill: HEX.pale, size: 20 });
        } },
        { k: "bul", h: "Hash join: cost and conditions", src: src("§15.5.5"), items: [
          "Only for equi-joins and natural joins",
          "Build input: the smaller relation; each ri must fit in memory",
          "Without recursive partitioning: about 3 (br + bs) block transfers: read and write both, then read both again",
          "student ⋈ takes: about 3 · (100 + 400) = 1,500 transfers",
          "If memory is too small, partitions are split again: recursive partitioning"] },
        { k: "table", h: "Cost comparison: student ⋈ takes", src: src("§15.5 (running example)"), size: 20, rowH: 0.66, colW: [5.0, 4.0, 3.13], rows: [
          ["Algorithm", "Block transfers", "Assumption"],
          ["Nested loop, student outer", "2,000,100", "worst case"],
          ["Nested loop, takes outer", "1,000,400", "worst case"],
          ["Block nested loop, student outer", "40,100", "worst case"],
          ["Indexed nested loop", "25,100", "B+-tree on takes(ID)"],
          ["Hash join", "about 1,500", "no recursion"],
          ["Block nested loop or merge join", "500", "enough memory / sorted"]] },
        { k: "draw", h: "The same join, four orders of magnitude", src: "Chart drawn for IDB201 from the costs of DSC 7th ed., §15.5 (logarithmic scale)", draw: (s) => {
          s.addChart("bar", [{ name: "Block transfers", labels: ["Nested loop", "Block NL", "Indexed NL", "Hash join", "Merge join"], values: [2000100, 40100, 25100, 1500, 500] }],
            { x: X0, y: 1.4, w: 8.6, h: 5.2, barDir: "bar", chartColors: [HEX.navy], valAxisLogScaleBase: 10, valAxisMinVal: 100,
              showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 18, dataLabelFontFace: "Arial", dataLabelColor: HEX.ink, dataLabelFormatCode: "#,##0",
              catAxisLabelFontSize: 18, valAxisLabelFontSize: 18, catAxisLabelFontFace: "Arial", valAxisLabelFontFace: "Arial", valAxisLabelFormatCode: "#,##0",
              catAxisLabelColor: HEX.grey, valAxisLabelColor: HEX.grey, valGridLine: { color: "D5DCE3", size: 1 }, catGridLine: { style: "none" }, showLegend: false, catAxisOrientation: "maxMin" });
          L.autoCard(s, 9.5, 1.4, 3.2, 5.2, "Lesson", ["Choosing the algorithm matters more than any hardware upgrade", "This choice is the optimizer's job: session 46"], "lesson", { fill: HEX.paleOrange, size: 20 });
        } },
        { k: "quick", h: "Quick check: session 45", src: "Questions written for IDB201 on DSC 7th ed., §15.5",
          qs: ["Why is takes as the outer relation better than student in the simple nested-loop join?",
               "Which join algorithms can evaluate student ⋈ takes on student.tot_cred > takes.credits?",
               "Why should the smaller relation be the build input of a hash join?"],
          ans: "1 the inner relation is read once per outer tuple: 10,000 scans of 100 blocks beat 5,000 scans of 400 blocks; 2 only nested-loop variants: merge and hash join need equality; 3 its partitions must fit in memory." },
      ] },
    // ------------------------------------------------------------ 46
    { n: 46, name: "Query optimization", sum: "16.1 overview; 16.2 equivalence rules; reading execution plans in SQL Server",
      slides: [
        { k: "bul", h: "16.1 Overview of query optimization", src: src("§16.1"), items: [
          "A query has many equivalent expressions and each has many evaluation plans",
          "Cost-based optimization: generate equivalent expressions, choose algorithms, estimate the cost of each plan, keep the cheapest",
          "Estimates use statistics: number of tuples, distinct values, histograms (self-study §16.3)",
          "A good and a bad plan can differ by orders of magnitude (session 45)"],
          bottom: "The user writes what to compute; the optimizer decides how." },
        { k: "draw", h: "Example: Physics courses and instructors", src: "Example after DSC 7th ed., §16.1–16.2, on the course database University (givenDB)", draw: (s) => {
          L.code(s, "select i.name, c.title\nfrom   instructor i\n  join teaches t on i.ID = t.ID\n  join course c\n    on t.course_id = c.course_id\nwhere  i.dept_name = 'Physics';", X0, 1.4, 7.4, 2.5, { size: 20 });
          L.autoCard(s, 8.3, 1.4, 4.4, 2.4, "Result on University", ["Curie, Mechanics", "Bohr, Electromagnetism"], "phy", { fill: HEX.pale, size: 20 });
          L.autoCard(s, X0, 4.2, CW, 2.3, null, ["Translated directly, the selection on dept_name is applied after both joins", "Two expression trees for this query follow: before and after the rewrite"], "phy2", { fill: HEX.paleOrange, size: 22 });
        } },
        { k: "table", h: "16.2 Selected equivalence rules", src: src("§16.2.1 (numbering of DSC; more rules for set operations, aggregation, outer joins)"), size: 20, rowH: 0.62, colW: [0.8, 7.4, 3.93], rows: [
          ["#", "Rule", "Use"],
          ["1", "σθ1∧θ2(E) ≡ σθ1(σθ2(E))", "split a conjunction"],
          ["2", "σθ1(σθ2(E)) ≡ σθ2(σθ1(E))", "selections commute"],
          ["4", "σθ(E1 × E2) ≡ E1 ⋈θ E2", "product into join"],
          ["5", "E1 ⋈θ E2 ≡ E2 ⋈θ E1", "join commutativity"],
          ["6", "(E1 ⋈ E2) ⋈ E3 ≡ E1 ⋈ (E2 ⋈ E3)", "join order"],
          ["7", "σθ0(E1 ⋈θ E2) ≡ σθ0(E1) ⋈θ E2, θ0 on E1 only", "push selections down"],
          ["8", "ΠL1∪L2(E1 ⋈θ E2) ≡ ΠL1(E1) ⋈θ ΠL2(E2)", "push projections (θ on L1 ∪ L2)"]] },
        { k: "draw", h: "Expression tree before optimization", src: "Example after DSC 7th ed., §16.2, on the course database University (givenDB)", draw: (s) => {
          etree(s, BEFORE, 0.8, 1.4, 7.6, { hl: ["σ dept_name = 'Physics'"] });
          L.autoCard(s, 9.0, 1.4, 3.7, 5.1, "Problem", ["instructor ⋈ teaches is built for every department: 18 tuples on University", "Only 2 of them survive the selection"], "bef", { fill: HEX.pale, size: 20 });
        } },
        { k: "draw", h: "After pushing the selection down (rule 7)", src: "Example after DSC 7th ed., §16.2, on the course database University (givenDB)", draw: (s) => {
          etree(s, AFTER, 0.8, 1.4, 7.6, { hl: ["σ dept_name = 'Physics'"] });
          L.autoCard(s, 9.0, 1.4, 3.7, 5.1, "Gain", ["Only the 2 Physics instructors enter the first join", "Intermediate results shrink from 18 to 2 tuples; on large data, from millions to thousands"], "aft", { fill: HEX.paleOrange, size: 20 });
        } },
        { k: "table", h: "Join ordering", src: src("§16.2.3; optional §16.4"), size: 22, rowH: 0.62, colW: [3.0, 4.2], w: 7.2,
          rows: [["Relations n", "Join orders"], ["3", "12"], ["4", "120"], ["5", "1,680"], ["7", "665,280"], ["10", "17,643,225,600"]],
          right: { x: 7.9, w: 4.8, card: ["Why it grows", ["(2(n − 1))! / (n − 1)! orders of n relations", "Rules 5 and 6 generate them all", "Dynamic programming finds the best in O(3ⁿ) (optional §16.4)", "Heuristics: e.g. left-deep trees only"]] } },
        { k: "cards", h: "Heuristics and statistics", src: src("§16.1–16.2; self-study §16.3"), cards: [
          ["Selections early", "They shrink the inputs of later operations (rule 7)"],
          ["Projections early", "Fewer attributes: more tuples per block (rule 8)"],
          ["Statistics", "nr, br, distinct values V(A, r), histograms: the basis of every estimate"],
          ["Estimates can be wrong", "Old statistics, correlated attributes: CQ9.1", HEX.paleOrange]] },
        { k: "code", h: "Reading execution plans in SQL Server", src: SQLS, codeW: 7.4, code:
"set statistics io on;   -- logical reads\nset statistics time on; -- CPU, elapsed\n\nselect s.name, t.course_id\nfrom   student s\n       join takes t on s.ID = t.ID\nwhere  s.dept_name = 'Physics';\n\n-- SSMS: estimated plan  Ctrl+L\n--       actual plan     Ctrl+M",
          card: ["What to look for", ["Read the graphical plan from right to left", "Access: Table Scan, Clustered Index Scan, Index Seek, Key Lookup", "Join: Nested Loops, Merge Join, Hash Match", "Estimated versus actual rows"]] },
        { k: "table", h: "Plan operators and DSC algorithms", src: SQLS + "; DSC 7th ed., §15.3–15.5", size: 20, rowH: 0.66, colW: [4.4, 7.73], rows: [
          ["SQL Server operator", "Algorithm in DSC"],
          ["Table Scan, Clustered Index Scan", "A1 linear search"],
          ["Clustered Index Seek", "A2/A3 clustering B+-tree index"],
          ["Index Seek + Key Lookup", "A4 secondary index"],
          ["Nested Loops", "nested-loop or indexed nested-loop join"],
          ["Merge Join", "merge join"],
          ["Hash Match", "hash join (also grouping)"],
          ["Sort", "in-memory or external sort-merge"]] },
        { k: "draw", h: "The plan to expect for a small query", src: "Drawn for IDB201 in the style of SQL Server graphical plans; confirm it in Lab 5 part 1", draw: (s) => {
          L.code(s, "select s.name from student s join takes t on s.ID = t.ID\nwhere  t.course_id = 'CS-315';", X0, 1.35, CW, 0.9, { size: 20 });
          L.node(s, "SELECT", 0.6, 3.4, 1.8, 0.85, { fill: HEX.pale });
          L.node(s, "Nested Loops\n(inner join)", 3.2, 3.3, 2.8, 1.05, { fill: HEX.paleOrange });
          L.node(s, "Clustered Index Scan: takes\nfilter course_id = 'CS-315'", 7.3, 2.6, 5.3, 1.0, { size: 18 });
          L.node(s, "Clustered Index Seek: student\nseek s.ID = t.ID", 7.3, 4.3, 5.3, 1.0, { size: 18 });
          L.arrow(s, 3.2, 3.82, 2.4, 3.82); L.arrow(s, 7.3, 3.1, 6.0, 3.6); L.arrow(s, 7.3, 4.8, 6.0, 4.1);
          L.text(s, "4 rows (outer)", 6.1, 2.55, 1.6, 0.4, { fontSize: 18, color: HEX.orange, bold: true });
          L.text(s, "Data flows right to left. 4 outer rows: 4 seeks cost less than building a hash table. On a large table (Lab 5) the optimizer may switch to a hash join.", X0, 5.65, CW, 0.9, { fontSize: 20, color: HEX.grey });
        } },
        { k: "quick", h: "Quick check: session 46", src: "Questions written for IDB201 on DSC 7th ed., §16.1–16.2",
          qs: ["Which equivalence rule moves σ dept_name = 'Physics' below a join, and what does it require?",
               "How many join orders do 4 relations have?",
               "In a graphical plan, what does an Index Seek followed by a Key Lookup correspond to in DSC?"],
          ans: "1 rule 7: the condition uses only attributes of one input; 2 (2 · 3)! / 3! = 120; 3 algorithm A4: a secondary index, then one fetch per matching record." },
      ] },
    // ------------------------------------------------------------ 47
    { n: 47, name: "Guided exercises", sum: "Costs by hand: selection, sorting, joins; size estimates; equivalence rules; SQL Server plans; CQ9.1–CQ9.3",
      slides: [
        { k: "plan", h: "Plan of session 47", src: "IDB201 syllabus, session 47", rows: [
          ["Exercises 1–2", "Selection and external sorting", "10 min"],
          ["Exercise 3", "Join costs", "10 min"],
          ["Exercises 4–5", "Size estimates; equivalence rules", "10 min"],
          ["CQ9.1–CQ9.3", "Discussion in groups, then whole class", "13 min", true],
          ["Next", "Lab 5 part 1 in session 48", "2 min"]] },
        { k: "list", h: "Exercises 1–2: selection and sorting", src: "Exercises written for IDB201; DSC 7th ed., §15.3–15.4", items: [
          "Exercise 1. r has 2,000 blocks. A secondary B+-tree on the non-key attribute A has height 3; σA=v matches 30 records. Compare the index plan with a linear scan (tT = 0.1 ms, tS = 4 ms).",
          "Exercise 2. Sort a relation of 1,000 blocks with M = 11, then with M = 101. Give the runs, the merge passes and the block transfers."] },
        { k: "table", h: "Exercises 1–2: solutions", src: "Solutions written for IDB201; formulas of DSC 7th ed., §15.3–15.4", size: 20, rowH: 0.72, colW: [4.6, 4.6, 2.93], rows: [
          ["Case", "Computation", "Result"],
          ["Ex. 1 index (A4)", "(3 + 30) · 4.1", "135.3 ms"],
          ["Ex. 1 scan (A1)", "4 + 2,000 · 0.1", "204 ms"],
          ["Ex. 2, M = 11", "91 runs, ⌈log10 91⌉ = 2 passes", "1,000 · 5 = 5,000"],
          ["Ex. 2, M = 101", "10 runs, ⌈log100 10⌉ = 1 pass", "1,000 · 3 = 3,000"]],
          note: "Ex. 1: the index wins with 30 matches; at about 47 matches the two plans cost the same." },
        { k: "list", h: "Exercise 3: join costs", src: "Exercise written for IDB201; DSC 7th ed., §15.5", items: [
          "r has 1,000 blocks and s has 200 blocks; the join is an equi-join.",
          "Compute the block transfers of block nested-loop join with M = 3 and with M = 52, each with r outer and with s outer.",
          "Compare with merge join (inputs already sorted) and hash join (no recursive partitioning)."] },
        { k: "table", h: "Exercise 3: solution", src: "Solution written for IDB201; formulas of DSC 7th ed., §15.5", size: 20, rowH: 0.66, colW: [4.4, 5.2, 2.53], rows: [
          ["Algorithm", "Computation", "Transfers"],
          ["BNL, M = 3, r outer", "1,000 · 200 + 1,000", "201,000"],
          ["BNL, M = 3, s outer", "200 · 1,000 + 200", "200,200"],
          ["BNL, M = 52, r outer", "⌈1,000 / 50⌉ · 200 + 1,000", "5,000"],
          ["BNL, M = 52, s outer", "⌈200 / 50⌉ · 1,000 + 200", "4,200"],
          ["Merge join", "1,000 + 200", "1,200"],
          ["Hash join", "3 · (1,000 + 200)", "about 3,600"]] },
        { k: "cards", h: "Exercise 4: size estimates", src: "Exercise written for IDB201; estimates of DSC 7th ed., §16.3", cards: [
          ["Question a", "instructor: 10,000 tuples, 20 distinct dept_name values. Estimate the size of σ dept_name = 'Physics'."],
          ["Answer a", "nr / V(dept_name, r) = 10,000 / 20 = 500 tuples, assuming a uniform distribution", HEX.paleOrange],
          ["Question b", "takes ⋈ student on ID, 10,000 takes tuples; ID is a foreign key to student. Estimate the size."],
          ["Answer b", "Each takes tuple joins exactly one student: 10,000 tuples", HEX.paleOrange]] },
        { k: "draw", h: "Exercise 5: equivalence rules", src: "Exercise and solution written for IDB201; rules of DSC 7th ed., §16.2.1", draw: (s) => {
          L.text(s, "Rewrite Π name (σ dept_name = 'Physics' ∧ year = 2025 (instructor ⋈ teaches)) so that each selection is applied as early as possible.", X0, 1.35, CW, 0.85, { fontSize: 20 });
          etree(s, N("Π name", N("⋈", N("σ dept_name = 'Physics'", N("instructor")), N("σ year = 2025", N("teaches")))), 0.8, 2.4, 7.0, { hl: ["σ dept_name = 'Physics'", "σ year = 2025"], dy: 1.0 });
          L.autoCard(s, 8.4, 2.4, 4.3, 4.1, "Steps", ["Rule 1: split the conjunction", "Rule 7: push each part to the input that has its attribute", "On University the result is Curie (Bohr teaches in 2026)"], "ex5", { fill: HEX.pale, size: 20 });
        } },
        { k: "code", h: "Exercise 6: compare with SQL Server", src: "Exercise written for IDB201 on the course database University (givenDB); " + SQLS, codeW: 7.4, code:
"set statistics io on;\n\nselect i.name\nfrom   instructor i\n       join teaches t on i.ID = t.ID\nwhere  i.dept_name = 'Physics'\n  and  t.year = 2025;\n\n-- Ctrl+M: include actual plan",
          card: ["Questions", ["Where are the two conditions applied in the plan?", "Which join operator is chosen, and why for such small tables?", "Compare estimated and actual rows", "Lab 5 repeats this on a large table"]] },
        { k: "cq", id: "CQ9.1", look: "Where to look: self-study DSC 7th ed., §16.3; Leis et al., How good are query optimizers, really?, PVLDB 9(3), 2015", prompts: [
          "Statistics that are out of date",
          "Independence assumptions between attributes",
          "How do errors grow through several joins?"] },
        { k: "cq", id: "CQ9.2", look: "Where to look: DSC 7th ed., §16.2; optional §16.4; Chapter 3 (equivalent formulations)", prompts: [
          "What does the optimizer see after translation?",
          "Which rewrites must it know, e.g. turning a subquery into a join?",
          "Test it: compare the plans in SQL Server"] },
        { k: "cq", id: "CQ9.3", look: "Where to look: optional DSC 7th ed., §16.4; Selinger et al., Access path selection in a relational DBMS, SIGMOD 1979", prompts: [
          "Count the join orders for n = 3, 4, 5",
          "What does dynamic programming save?",
          "What is lost by considering only left-deep trees?"] },
      ] },
  ],
  back: [
    { k: "list", h: "Practice exercises", src: "Exercises written for IDB201; more: DSC Practice Exercises 15.1–15.5 and 16.1–16.4", items: [
      "takes (10,000 tuples, 400 blocks) is the outer relation of an indexed nested-loop join with student; the B+-tree on student(ID) has height 3. Compute the block transfers.",
      "Is it legal to push σ year = 2025 below the join in Π name (σ year = 2025 (instructor ⋈ teaches))? Below which input?",
      "Which join algorithms can evaluate r ⋈ s on r.A < s.B, and why?"] },
    { k: "list", h: "Practice exercises: answers", src: "Answers written for IDB201 on DSC 7th ed., §15.5 and §16.2", fill: HEX.pale, items: [
      "400 + 10,000 · (3 + 1) = 40,400: worse than with student outer (25,100), because takes has more tuples.",
      "Yes, by rule 7: year is an attribute of teaches only, so Π name (instructor ⋈ σ year = 2025 (teaches)).",
      "Only nested-loop and block nested-loop joins (or an ordered index on s.B): merge and hash join need an equality condition."] },
    { k: "cards", h: "Summary", src: "DSC 7th ed., Ch. 15–16", cols: 3, num: false, cards: [
      ["Processing", "Parse and translate, optimize, evaluate"],
      ["Cost", "Block transfers and seeks"],
      ["Selection and sorting", "Scan or index; external sort-merge"],
      ["Joins", "Costs differ by orders of magnitude"],
      ["Optimization", "Equivalence rules; join order matters most"],
      ["SQL Server plans", "Show the chosen algorithms", HEX.paleOrange]] },
    { k: "cards", h: "Before the next session", src: "IDB201 syllabus, sessions 47–49", cards: [
      ["Within one week", "Choose one of CQ9.1–CQ9.3 and submit your answer on the LMS"],
      ["Session 48", "Lab 5 part 1: indexes and execution plans on a large table", HEX.paleOrange],
      ["Session 49", "Read DSC Ch. 17, §17.1–17.4, pp. 799–806, and §17.10"]] },
  ],
};

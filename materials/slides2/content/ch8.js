// Chapter 8 – Data storage structures and indexing (sessions 40–43)
const L = require("../lib");
const { HEX, X0, CW } = L;
const src = (x) => `Source: DSC 7th ed., ${x}`;
const drawn = (x) => `Diagram drawn for IDB201 after DSC 7th ed., ${x}`;
const ex = (x) => `Example on the course database University (givenDB); DSC 7th ed., ${x}`;
const SQLS = "Microsoft SQL Server 2022 documentation (pages and extents; index architecture)";

// ---------- drawing helpers (all labels >= 18 pt) ----------
// one B+-tree node: a row of key cells; returns geometry and pointer x positions
function bnode(s, keys, x, y, o = {}) {
  const cw = o.cw || 0.98, h = o.h || 0.6, w = keys.length * cw;
  keys.forEach((k, i) => {
    s.addShape("rect", { x: x + i * cw, y, w: cw, h, fill: { color: o.fill || HEX.white }, line: { color: HEX.navy, width: 1.5 } });
    s.addText(String(k), { x: x + i * cw, y, w: cw, h, fontSize: 18, bold: true, color: HEX.navy, align: "center", valign: "middle", isTextBox: true, margin: 0, fontFace: o.mono ? "Courier New" : undefined });
  });
  const ptr = (i) => x + Math.min(Math.max(i * cw, 0.08), w - 0.08);
  return { x, y, w, h, cx: x + w / 2, ptr };
}
// a whole tree, bottom-up: levels[0] = leaves (arrays of keys); levels[k] = [{ keys, kids }]
function tree(s, levels, o = {}) {
  const cw = o.cw || 0.98, gap = o.gap || 0.22, x0 = o.x0 || 0.35, yLeaf = o.yLeaf || 4.4, dy = o.dy || 1.35;
  const hl = o.hl || [];
  let row = []; let x = x0;
  levels[0].forEach((keys, i) => {
    row.push(bnode(s, keys, x, yLeaf, { cw, mono: o.mono, fill: hl.includes(`0:${i}`) ? HEX.paleOrange : HEX.pale }));
    x += keys.length * cw + gap;
  });
  for (let i = 0; i < row.length - 1; i++) L.arrow(s, row[i].x + row[i].w, yLeaf + 0.3, row[i + 1].x, yLeaf + 0.3, { color: HEX.green, width: 1.5 });
  for (let lv = 1; lv < levels.length; lv++) {
    const y = yLeaf - lv * dy, next = []; let c = 0;
    levels[lv].forEach((nd, j) => {
      const kids = row.slice(c, c + nd.kids); c += nd.kids;
      const span = (kids[0].x + kids[kids.length - 1].x + kids[kids.length - 1].w) / 2;
      const b = bnode(s, nd.keys, span - (nd.keys.length * cw) / 2, y, { cw, mono: o.mono, fill: hl.includes(`${lv}:${j}`) ? HEX.paleOrange : HEX.white });
      kids.forEach((k, i) => L.arrow(s, b.ptr(i), y + 0.6, k.cx, k.y, { width: 1.5, color: HEX.navy }));
      next.push(b);
    });
    row = next;
  }
}
// static hashing: rows of buckets with capacity cap and overflow chains
function buckets(s, nb, cap, keys, h, x, y, o = {}) {
  const rows = Array.from({ length: nb }, () => []);
  keys.forEach((k) => rows[h(k)].push(k));
  const rh = o.rh || 0.58, cw = 0.8;
  rows.forEach((r, i) => {
    const yy = y + i * (rh + 0.12);
    L.text(s, `bucket ${i}`, x, yy, 1.5, rh, { fontSize: 18, color: HEX.grey, valign: "middle" });
    for (let j = 0; j < cap; j++) {
      s.addShape("rect", { x: x + 1.55 + j * cw, y: yy, w: cw, h: rh, fill: { color: r.length > cap ? HEX.paleOrange : HEX.pale }, line: { color: HEX.navy, width: 1.25 } });
      if (r[j] !== undefined) L.text(s, String(r[j]), x + 1.55 + j * cw, yy, cw, rh, { fontSize: 18, bold: true, color: HEX.navy, align: "center", valign: "middle" });
    }
    if (r.length > cap) {
      const ox = x + 1.55 + cap * cw + 0.6;
      L.arrow(s, x + 1.55 + cap * cw, yy + rh / 2, ox, yy + rh / 2, { color: HEX.orange, width: 1.5 });
      for (let j = 0; j < cap; j++) {
        s.addShape("rect", { x: ox + j * cw, y: yy, w: cw, h: rh, fill: { color: HEX.white }, line: { color: HEX.orange, width: 1.25, dashType: "dash" } });
        if (r[cap + j] !== undefined) L.text(s, String(r[cap + j]), ox + j * cw, yy, cw, rh, { fontSize: 18, bold: true, color: HEX.orange, align: "center", valign: "middle" });
      }
    }
  });
  return rows;
}
// a block drawn as a stack of record rows
function block(s, title, recs, x, y, w, o = {}) {
  const rh = o.rh || 0.45;
  L.text(s, title, x, y - 0.45, w, 0.42, { fontSize: 18, bold: true, color: o.titleColor || HEX.navy });
  recs.forEach((r, i) => {
    const fill = Array.isArray(r) ? r[1] : (o.fill || HEX.white);
    s.addShape("rect", { x, y: y + i * rh, w, h: rh, fill: { color: fill }, line: { color: HEX.navy, width: 1.25 } });
    L.text(s, Array.isArray(r) ? r[0] : r, x + 0.1, y + i * rh, w - 0.2, rh, { fontSize: 18, valign: "middle", fontFace: "Courier New" });
  });
}

const NAME_TREE = [
  [["Bohr", "Curie"], ["Dang", "Hoang", "Keynes"], ["Le", "Mendel"], ["Nguyen", "Pham"], ["Smith", "Tran", "Vu"]],
  [{ keys: ["Dang", "Le"], kids: 3 }, { keys: ["Smith"], kids: 2 }],
  [{ keys: ["Nguyen"], kids: 2 }]];

module.exports = {
  n: 8,
  title: "Data storage structures and indexing",
  textbook: "DSC Ch. 13, §13.1–13.3 and §13.5, pp. 587–610; Ch. 14, §14.1–14.3, §14.5 and §14.7, pp. 623–664; self-study §12.1, §12.6, §13.4, §14.4, §14.6.",
  clos: ["CLO6"],
  objectives: [
    "Explain why the block is the unit of storage and of cost",
    "Describe record layouts, file organizations and the role of the database buffer",
    "Distinguish clustering and secondary, dense and sparse indices",
    "Search and insert into a B+-tree by hand and estimate its height",
    "Explain static hashing and choose between a B+-tree, a hash index and a scan",
  ],
  roadNote: "Session 48: Lab 5 part 1 (indexes and execution plans) uses this chapter and Chapter 9",
  sessions: [
    // ------------------------------------------------------------ 40
    { n: 40, name: "Storage", sum: "13.1 storage architecture; 13.2–13.3 records and files; 13.5 the database buffer",
      slides: [
        { k: "draw", h: "13.1 Database storage architecture", src: drawn("§13.1; self-study §12.1"), draw: (s) => {
          L.node(s, "Query processor", 0.8, 1.55, 3.2, 0.9, { fill: HEX.pale });
          L.node(s, "Buffer manager\n(main memory)", 0.8, 3.2, 3.2, 1.1, { fill: HEX.paleOrange });
          L.node(s, "Disk or SSD\n(non-volatile)", 0.8, 5.1, 3.2, 1.1, { fill: HEX.white });
          L.arrow(s, 2.4, 2.45, 2.4, 3.2); L.arrow(s, 2.1, 4.3, 2.1, 5.1); L.arrow(s, 2.7, 5.1, 2.7, 4.3, { color: HEX.orange });
          L.text(s, "blocks", 2.85, 4.5, 1.3, 0.4, { fontSize: 18, color: HEX.orange, bold: true });
          L.autoCard(s, 4.8, 1.55, 7.9, 4.65, "Key ideas", [
            "Data must be in main memory to be processed, but main memory is volatile and small",
            "The database is stored in files on non-volatile storage",
            "Files are divided into fixed-size blocks: the unit of allocation and of transfer",
            "The cost of a query is dominated by the number of block transfers (and seeks)"], "arch", { fill: HEX.pale, size: 22 });
        } },
        { k: "cards", h: "Why the block is the unit of cost", src: src("§13.1; §15.2 (tS and tT); self-study §12.6"), cards: [
          ["Seek", "Moving the disk arm to the right track: about tS = 4 ms on a magnetic disk"],
          ["Transfer", "Reading one 4 KB block once the head is in place: about tT = 0.1 ms"],
          ["Consequence", "Read related records together, read blocks in sequence, and avoid random seeks", HEX.paleOrange]],
          note: "Processing a record in memory takes microseconds; fetching its block can take milliseconds." },
        { k: "bul", h: "Pages and extents in SQL Server", src: SQLS, items: [
          "A data file is divided into pages of 8 KB: the unit of I/O",
          "Eight contiguous pages form an extent of 64 KB, the unit of allocation",
          "A row (except large values) must fit in one page",
          "set statistics io on reports logical reads: pages read from the buffer"],
          right: { draw: (s) => {
            L.text(s, "One extent = 8 pages", 7.4, 1.5, 5.2, 0.45, { fontSize: 20, bold: true, color: HEX.navy });
            for (let i = 0; i < 8; i++) L.node(s, `p${i + 1}`, 7.4 + (i % 4) * 1.3, 2.1 + Math.floor(i / 4) * 1.1, 1.15, 0.9, { size: 18, fill: i === 2 ? HEX.paleOrange : HEX.pale });
            L.text(s, "Each page: 8 KB; a page header, the rows, and a row-offset array at its end (a slotted page)", 7.4, 4.45, 5.2, 1.5, { fontSize: 20, color: HEX.grey });
          } } },
        { k: "draw", h: "13.2 Fixed-length records", src: drawn("§13.2.1"), draw: (s) => {
          L.code(s, "instructor (ID varchar(5), name varchar(20),\n            dept_name varchar(20), salary numeric(8,2))\n-- 5 + 20 + 20 + 8 = 53 bytes per record", X0, 1.4, CW, 1.15, { size: 20 });
          block(s, "File with a free list", [["header: first free → record 2", HEX.pale], "record 0: I1001 Nguyen Comp. Sci. 92000", "record 1: I1002 Tran   Comp. Sci. 78000", ["record 2: (deleted) → record 4", HEX.paleOrange], "record 3: I2001 Pham   Mathematics 88000", ["record 4: (deleted) → none", HEX.paleOrange]], X0, 3.2, 7.6, { rh: 0.5 });
          L.autoCard(s, 8.5, 2.85, 4.2, 3.6, "Rules", ["Record i starts at byte 53 · i", "Deleted slots are chained in a free list", "A record should not cross a block boundary"], "fixed", { fill: HEX.pale, size: 20 });
        } },
        { k: "draw", h: "13.2 Variable-length records", src: drawn("§13.2.2 (layout of DSC Figure 13.5, with a University row)"), draw: (s) => {
          const cells = [["21, 5", 1.25], ["26, 2", 1.25], ["28, 10", 1.25], ["65000", 1.4], ["0000", 1.0], ["I1003", 1.25], ["Le", 0.8], ["Comp. Sci.", 1.7]];
          let x = X0 + 0.3;
          const bytes = ["0", "4", "8", "12", "20", "21", "26", "28"];
          cells.forEach(([t, w], i) => {
            s.addShape("rect", { x, y: 2.0, w, h: 0.75, fill: { color: i < 3 ? HEX.paleOrange : (i === 4 ? HEX.pale : HEX.white) }, line: { color: HEX.navy, width: 1.5 } });
            L.text(s, t, x, 2.0, w, 0.75, { fontSize: 18, bold: true, color: HEX.navy, align: "center", valign: "middle", fontFace: "Courier New" });
            L.text(s, bytes[i], x, 2.8, 0.6, 0.4, { fontSize: 18, color: HEX.grey });
            x += w;
          });
          L.text(s, "byte offset", X0 + 0.3, 3.2, 2.0, 0.4, { fontSize: 18, color: HEX.grey, italic: true });
          L.autoCard(s, X0, 3.9, 5.9, 2.6, "Fixed part", ["(offset, length) for each variable attribute: ID, name, dept_name", "Fixed-size salary", "Null bitmap: one bit per attribute"], "vl1", { fill: HEX.paleOrange, size: 20 });
          L.autoCard(s, 6.85, 3.9, 5.85, 2.6, "Variable part", ["The values themselves, after the fixed part", "Here the row I1003, Le, Comp. Sci., 65000 of University"], "vl2", { fill: HEX.pale, size: 20 });
        } },
        { k: "draw", h: "13.2 The slotted-page structure", src: drawn("§13.2.2"), draw: (s) => {
          s.addShape("rect", { x: X0, y: 1.6, w: 12.1, h: 1.6, fill: { color: HEX.white }, line: { color: HEX.navy, width: 2 } });
          s.addShape("rect", { x: X0, y: 1.6, w: 3.3, h: 1.6, fill: { color: HEX.paleOrange }, line: { color: HEX.navy, width: 1.5 } });
          L.text(s, "Header: #entries, end of free space, (location, size) of each record", X0 + 0.1, 1.65, 3.1, 1.5, { fontSize: 18, valign: "middle" });
          L.text(s, "free space", 4.3, 1.6, 3.6, 1.6, { fontSize: 20, color: HEX.grey, align: "center", valign: "middle", italic: true });
          ["R3", "R2", "R1"].forEach((r, i) => { s.addShape("rect", { x: 8.5 + i * 1.4, y: 1.6, w: 1.4, h: 1.6, fill: { color: HEX.pale }, line: { color: HEX.navy, width: 1.5 } }); L.text(s, r, 8.5 + i * 1.4, 1.6, 1.4, 1.6, { fontSize: 20, bold: true, color: HEX.navy, align: "center", valign: "middle" }); });
          L.arrow(s, 4.0, 3.2, 4.0, 3.55, { noHead: true, color: HEX.orange }); L.arrow(s, 4.0, 3.55, 8.5, 3.55, { noHead: true, color: HEX.orange }); L.arrow(s, 8.5, 3.55, 8.5, 3.2, { color: HEX.orange });
          L.text(s, "end of free space", 5.3, 3.6, 3.0, 0.4, { fontSize: 18, color: HEX.orange, bold: true });
          L.autoCard(s, X0, 4.35, CW, 2.2, null, ["Records grow from the end of the block; the header grows from the start", "A record can move inside the page: only its header entry changes", "Pointers from outside point to the header entry, not to the record"], "slot", { fill: HEX.pale, size: 22 });
        } },
        { k: "table", h: "13.3 Organization of records in files", src: src("§13.3"), size: 20, rowH: 0.7, colW: [3.4, 8.73], rows: [
          ["Organization", "Idea"],
          ["Heap file", "A record goes anywhere there is space; a free-space map finds space"],
          ["Sequential file", "Records kept in search-key order; good for ordered reads"],
          ["Multitable clustering", "Related records of several relations share a block"],
          ["B+-tree file", "Records stored in the leaves of a B+-tree (session 42)"],
          ["Hashing", "A hash function on an attribute chooses the block"],
          ["Partitioning", "A relation is split by a value, e.g. by year"]] },
        { k: "draw", h: "13.3 A sequential file and an insertion", src: drawn("§13.3.2 (rows of University)"), draw: (s) => {
          block(s, "instructor, sorted by ID", ["I1001 Nguyen Comp. Sci. 92000", "I1002 Tran   Comp. Sci. 78000", "I2001 Pham   Mathematics 88000", "I3001 Curie  Physics     95000", "I3002 Bohr   Physics     83000"], X0, 1.95, 6.6);
          block(s, "overflow block", [["I1003 Le     Comp. Sci. 65000", HEX.paleOrange]], X0, 5.25, 6.6, { titleColor: HEX.orange });
          L.arrow(s, 7.2, 2.62, 7.6, 2.62, { noHead: true, color: HEX.orange }); L.arrow(s, 7.6, 2.62, 7.6, 5.47, { noHead: true, color: HEX.orange }); L.arrow(s, 7.6, 5.47, 7.2, 5.47, { color: HEX.orange });
          L.autoCard(s, 8.1, 1.95, 4.6, 4.5, "Insertion", ["I1003 belongs after I1002, but the block is full", "It goes to an overflow block and the pointer chain keeps the order", "After many insertions the file is reorganized"], "seq", { fill: HEX.pale, size: 20 });
        } },
        { k: "draw", h: "13.3 Multitable clustering", src: drawn("§13.3.3 (rows of University)"), draw: (s) => {
          block(s, "One block holds a department and its instructors", [["Physics     Gamma 85000", HEX.paleOrange], "I3001 Curie Physics 95000", "I3002 Bohr  Physics 83000", ["Biology     Gamma 70000", HEX.paleOrange], "I4001 Mendel Biology 72000", "I9000 Dang   Biology null"], X0, 1.95, 6.6);
          L.autoCard(s, 7.6, 1.95, 5.1, 4.5, "Trade-off", ["Good for department ⋈ instructor: one block per department", "Bad for a scan of department alone: its records are spread over many blocks", "Choose by the most frequent queries"], "mtc", { fill: HEX.pale, size: 20 });
        } },
        { k: "draw", h: "13.5 The database buffer", src: drawn("§13.5"), draw: (s) => {
          L.node(s, "Request for block B", 0.6, 1.6, 3.4, 0.9, { fill: HEX.pale });
          s.addShape("diamond", { x: 4.6, y: 1.4, w: 2.6, h: 1.3, fill: { color: HEX.paleOrange }, line: { color: HEX.navy, width: 1.5 } });
          L.text(s, "B in the buffer?", 4.6, 1.4, 2.6, 1.3, { fontSize: 18, bold: true, color: HEX.navy, align: "center", valign: "middle" });
          L.arrow(s, 4.0, 2.05, 4.6, 2.05);
          L.node(s, "Return its address", 8.1, 1.6, 4.5, 0.9, { fill: HEX.white });
          L.arrow(s, 7.2, 2.05, 8.1, 2.05, { color: HEX.green }); L.text(s, "yes", 7.3, 1.55, 0.7, 0.4, { fontSize: 18, color: HEX.green, bold: true });
          L.arrow(s, 5.9, 2.7, 5.9, 3.4, { color: HEX.orange }); L.text(s, "no", 6.05, 2.85, 0.7, 0.4, { fontSize: 18, color: HEX.orange, bold: true });
          L.node(s, "Choose a victim (replacement policy); write it back if modified", 3.2, 3.4, 5.4, 1.1, { fill: HEX.white, size: 18 });
          L.arrow(s, 5.9, 4.5, 5.9, 5.1);
          L.node(s, "Read B from disk into the freed frame", 3.2, 5.1, 5.4, 0.9, { fill: HEX.white, size: 18 });
          L.arrow(s, 8.6, 5.55, 10.35, 5.55, { noHead: true }); L.arrow(s, 10.35, 5.55, 10.35, 2.5);
        } },
        { k: "cards", h: "13.5 Buffer replacement and its rules", src: src("§13.5.2"), cols: 3, cards: [
          ["LRU", "Evict the least recently used block: the usual default"],
          ["MRU", "Evict the most recently used: better for repeated scans, as in a nested-loop join"],
          ["Toss-immediate", "Free a block as soon as its last tuple is processed"],
          ["Pinned block", "In use: may not be evicted"],
          ["Forced output", "Written to disk even if its frame is not needed: used by recovery (Ch. 10)"],
          ["Why its own buffer?", "The DBMS can predict its access pattern better than the operating system", HEX.paleOrange]] },
        { k: "quick", h: "Quick check: session 40", src: "Questions written for IDB201 on DSC 7th ed., §13.1–13.5",
          qs: ["Why is the cost of a query measured in blocks and not in records?",
               "In a slotted page, why do outside pointers point to the header entry and not to the record?",
               "Name a query that multitable clustering of department with instructor makes slower."],
          ans: "1 a block transfer costs milliseconds, processing a record microseconds; 2 so the record can move inside the page; 3 a scan of department alone, e.g. select sum(budget) from department." },
      ] },
    // ------------------------------------------------------------ 41
    { n: 41, name: "Indices and B+-trees", sum: "14.1 basic concepts; 14.2 ordered indices; 14.3 B+-tree structure, search and height",
      slides: [
        { k: "cards", h: "14.1 Basic concepts", src: src("§14.1"), cards: [
          ["Search key", "The attribute(s) used to look up records; not necessarily a key"],
          ["Ordered index", "Entries sorted by search-key value"],
          ["Hash index", "Entries spread over buckets by a hash function"]],
          note: "Compare indices by access types (point, range), access time, insertion time, deletion time and space overhead." },
        { k: "draw", h: "14.2 A dense clustering index", src: drawn("§14.2.1 (rows of University)"), draw: (s) => {
          const ids = ["I1001", "I1002", "I1003", "I2001", "I2002", "I3001"];
          const rows = ["I1001 Nguyen Comp. Sci.", "I1002 Tran   Comp. Sci.", "I1003 Le     Comp. Sci.", "I2001 Pham   Mathematics", "I2002 Hoang  Mathematics", "I3001 Curie  Physics"];
          ids.forEach((id, i) => {
            L.node(s, id, 1.0, 1.6 + i * 0.72, 1.6, 0.55, { size: 18, fill: HEX.paleOrange, mono: true });
            s.addShape("rect", { x: 5.0, y: 1.6 + i * 0.72, w: 5.0, h: 0.55, fill: { color: HEX.white }, line: { color: HEX.navy, width: 1.25 } });
            L.text(s, rows[i], 5.1, 1.6 + i * 0.72, 4.8, 0.55, { fontSize: 18, valign: "middle", fontFace: "Courier New" });
            L.arrow(s, 2.6, 1.87 + i * 0.72, 5.0, 1.87 + i * 0.72, { width: 1.5 });
          });
          L.text(s, "index on ID", 1.0, 1.1, 2.6, 0.45, { fontSize: 18, bold: true, color: HEX.orange });
          L.text(s, "file sorted by ID", 5.0, 1.1, 5.0, 0.45, { fontSize: 18, bold: true, color: HEX.navy });
          L.text(s, "Dense: one entry for every search-key value. Clustering: the file is sorted on the same key.", X0, 6.05, CW, 0.6, { fontSize: 20, color: HEX.grey });
        } },
        { k: "draw", h: "14.2 A sparse clustering index", src: drawn("§14.2.1 (rows of University)"), draw: (s) => {
          const blocks = [["I1001 Nguyen", "I1002 Tran", "I1003 Le"], ["I2001 Pham", "I2002 Hoang", "I3001 Curie"], ["I3002 Bohr", "I4001 Mendel", "I5001 Keynes"]];
          blocks.forEach((b, i) => {
            const y = 1.5 + i * 1.6;
            L.node(s, b[0].slice(0, 5), 1.0, y, 1.6, 0.55, { size: 18, fill: HEX.paleOrange, mono: true });
            b.forEach((r, j) => { s.addShape("rect", { x: 5.0, y: y + j * 0.45, w: 3.6, h: 0.45, fill: { color: HEX.white }, line: { color: HEX.navy, width: 1.25 } }); L.text(s, r, 5.1, y + j * 0.45, 3.4, 0.45, { fontSize: 18, valign: "middle", fontFace: "Courier New" }); });
            L.arrow(s, 2.6, y + 0.27, 5.0, y + 0.22, { width: 1.5 });
            L.text(s, `block ${i + 1}`, 8.75, y, 1.5, 0.45, { fontSize: 18, color: HEX.grey });
          });
          L.autoCard(s, 10.1, 1.5, 2.6, 4.4, "Find I2002", "Largest entry ≤ I2002 is I2001: read block 2 and scan it.", "sparse", { fill: HEX.pale, size: 20 });
          L.text(s, "Sparse: one entry per block. Possible only when the file is sorted on the search key.", X0, 6.15, CW, 0.5, { fontSize: 20, color: HEX.grey });
        } },
        { k: "table", h: "14.2 Kinds of ordered indices", src: src("§14.2"), size: 20, rowH: 0.8, colW: [3.3, 4.6, 4.23], rows: [
          ["Kind", "Definition", "Remark"],
          ["Clustering (primary)", "Search key defines the order of the file", "At most one per file"],
          ["Secondary (nonclustering)", "Order of the file differs", "Must be dense"],
          ["Dense", "An entry for every search-key value", "Fast, larger"],
          ["Sparse", "Entries for some values (e.g. one per block)", "Smaller; clustering only"],
          ["Multilevel", "An index on the index", "When the index does not fit in memory"]] },
        { k: "draw", h: "14.2 Multilevel indices", src: drawn("§14.2.2"), draw: (s) => {
          L.node(s, "outer index", 0.8, 3.0, 2.4, 1.0, { fill: HEX.paleOrange });
          ["inner index block 0", "inner index block 1", "inner index block 2"].forEach((t, i) => { L.node(s, t, 4.4, 1.6 + i * 1.5, 3.0, 0.85, { size: 18 }); L.arrow(s, 3.2, 3.5, 4.4, 2.02 + i * 1.5, { width: 1.5 }); });
          ["data blocks", "data blocks", "data blocks"].forEach((t, i) => { L.node(s, t, 8.7, 1.6 + i * 1.5, 2.2, 0.85, { size: 18, fill: HEX.pale }); L.arrow(s, 7.4, 2.02 + i * 1.5, 8.7, 2.02 + i * 1.5, { width: 1.5 }); });
          L.text(s, "An index of 10,000 blocks needs about log₂ 10,000 ≈ 14 reads by binary search; with an outer sparse index that fits in memory, one read finds the inner block. A B+-tree generalizes this idea.", X0, 6.0, CW, 0.75, { fontSize: 20, color: HEX.grey });
        } },
        { k: "bul", h: "14.3 B+-tree: structure", src: src("§14.3.1"), leftW: 6.6, items: [
          "Balanced: every root-to-leaf path has the same length",
          "A node holds up to n − 1 keys K1 < K2 < … and up to n pointers",
          "Leaf: ⌈(n − 1)/2⌉ to n − 1 keys; Pi points to the record with Ki; Pn points to the next leaf",
          "Non-leaf: ⌈n/2⌉ to n pointers, except the root (at least 2)",
          "Keys in the subtree of Pi are ≥ Ki−1 and < Ki"],
          right: { draw: (s) => {
            const cells = ["P1", "K1", "P2", "…", "Kn−1", "Pn"];
            cells.forEach((c, i) => { s.addShape("rect", { x: 7.5 + i * 0.85, y: 2.0, w: 0.85, h: 0.75, fill: { color: c.startsWith("P") ? HEX.pale : HEX.white }, line: { color: HEX.navy, width: 1.5 } }); L.text(s, c, 7.5 + i * 0.85, 2.0, 0.85, 0.75, { fontSize: 18, bold: true, color: HEX.navy, align: "center", valign: "middle" }); });
            L.text(s, "A node of a B+-tree", 7.5, 1.45, 5.1, 0.45, { fontSize: 20, bold: true, color: HEX.navy });
            L.autoCard(s, 7.5, 3.2, 5.2, 3.3, "Size", "A node fills one disk block; with 4 KB blocks and 40-byte entries, n is about 100.", "bsz", { fill: HEX.paleOrange, size: 20 });
          } } },
        { k: "draw", h: "A B+-tree on instructor.name (n = 4)", src: "Example on the course database University (givenDB); structure of DSC 7th ed., §14.3.1", draw: (s) => {
          tree(s, NAME_TREE, { yLeaf: 4.3, dy: 1.3, cw: 1.04, gap: 0.12, x0: 0.25 });
          L.text(s, "Leaves (green links) hold all 12 names in order; each name points to its record. Every node has at most 3 keys and every non-root node is at least half full.", X0, 5.3, CW, 1.1, { fontSize: 20, color: HEX.grey });
        } },
        { k: "code", h: "14.3 Searching a B+-tree", src: src("§14.3.2 (procedure find)"), codeW: 7.4, code:
"function find(v)\n  C := root;\n  while C is not a leaf do\n    i := smallest i with v <= C.Ki;\n    if no such i then\n      C := last non-null pointer of C\n    else if v = C.Ki then C := C.P(i+1)\n    else C := C.Pi;\n  if some C.Ki = v then return C.Pi\n  else return null;",
          card: ["Idea", ["One node per level: from the root down to a leaf", "Equal key: go right of it, because the subtree of P(i+1) starts at Ki", "Cost: the height of the tree plus the record"]] },
        { k: "draw", h: "Tracing find('Mendel')", src: "Example on the course database University (givenDB); DSC 7th ed., §14.3.2", draw: (s) => {
          tree(s, NAME_TREE, { yLeaf: 4.3, dy: 1.3, cw: 1.04, gap: 0.12, x0: 0.25, hl: ["2:0", "1:0", "0:2"] });
          L.autoCard(s, X0, 5.2, CW, 1.4, null, ["Root: Mendel < Nguyen, follow P1 · Inner node: Mendel > Le, follow the last pointer · Leaf: Mendel found, follow its record pointer. Three nodes read."], "trace", { fill: HEX.paleOrange, size: 20 });
        } },
        { k: "table", h: "14.3 Height of a B+-tree", src: src("§14.3.2 (height analysis)"), size: 22, rowH: 0.75, colW: [6.0, 6.13], rows: [
          ["Quantity", "Value"],
          ["Search-key values N", "1,000,000"],
          ["Fan-out n (4 KB nodes)", "about 100, at least ⌈n/2⌉ = 50 per node"],
          ["Path length ≤ ⌈log⌈n/2⌉ N⌉", "⌈log50 1,000,000⌉ = 4 nodes"],
          ["Balanced binary tree", "about ⌈log2 1,000,000⌉ = 20 nodes"]],
          note: "The root and often the next level stay in the buffer, so a lookup costs one or two block reads in practice." },
        { k: "bul", h: "Range queries with a B+-tree", src: src("§14.3.2 (range queries)"), items: [
          "Find the first leaf entry ≥ the lower bound",
          "Follow the leaf chain until a key exceeds the upper bound",
          "Example: names between 'Hoang' and 'Nguyen' read leaves 2, 3 and 4, stopping at Pham",
          "Cost: the height, plus the leaves read, plus one fetch per matching record",
          "A hash index cannot do this: hashing destroys the order (session 42)"],
          bottom: "This is why most systems use the B+-tree as their default index." },
        { k: "quick", h: "Quick check: session 41", src: "Questions written for IDB201 on DSC 7th ed., §14.1–14.3",
          qs: ["Why must a secondary index be dense?",
               "In the tree on instructor.name, which nodes does find('Dang') read?",
               "A B+-tree has fan-out 100 and 10,000,000 keys. At most how many nodes are on a path?"],
          ans: "1 the file is not sorted on its key, so records with a value can be anywhere; 2 the root, then P1 to [Dang | Le], equal key so P2 to leaf [Dang, Hoang, Keynes]; 3 ⌈log50 10,000,000⌉ = 5 (50⁴ = 6,250,000 < 10⁷ ≤ 50⁵)." },
      ] },
    // ------------------------------------------------------------ 42
    { n: 42, name: "Updates and hashing", sum: "14.3 insertion and deletion (main idea); 14.5 hash indices; 14.7 creation of indices",
      slides: [
        { k: "bul", h: "14.3 Insertion into a B+-tree", src: src("§14.3.3"), items: [
          "Find the leaf where the key belongs; if it has room, insert it in order",
          "Leaf full: split it; keep the first ⌈n/2⌉ entries, move the rest to a new leaf",
          "Insert the smallest key of the new leaf, with a pointer to it, into the parent",
          "Parent full: split it; keep ⌈(n + 1)/2⌉ pointers, move the middle key up",
          "A root split adds a level: the tree grows at the top and stays balanced"] },
        { k: "draw", h: "A leaf split (n = 4)", src: "Example written for IDB201; algorithm of DSC 7th ed., §14.3.3", draw: (s) => {
          L.text(s, "Before: insert 25", X0, 1.4, 5.5, 0.45, { fontSize: 20, bold: true, color: HEX.navy });
          tree(s, [[[10, 20, 30], [40, 50]], [{ keys: [40], kids: 2 }]], { x0: 0.6, yLeaf: 3.3, dy: 1.25, cw: 0.85, hl: ["0:0"] });
          L.arrow(s, 5.4, 3.0, 6.6, 3.0, { color: HEX.orange, width: 3 });
          L.text(s, "After", 7.0, 1.4, 5.0, 0.45, { fontSize: 20, bold: true, color: HEX.navy });
          tree(s, [[[10, 20], [25, 30], [40, 50]], [{ keys: [25, 40], kids: 3 }]], { x0: 7.0, yLeaf: 3.3, dy: 1.25, cw: 0.85, hl: ["0:1", "1:0"] });
          L.autoCard(s, X0, 4.4, CW, 2.1, null, ["[10, 20, 25, 30] overflows: keep ⌈4/2⌉ = 2 entries, move 25 and 30 to a new leaf", "25, the smallest key of the new leaf, is copied into the parent: [25 | 40]"], "lsplit", { fill: HEX.pale, size: 22 });
        } },
        { k: "draw", h: "A split that reaches the root (n = 4)", src: "Example written for IDB201 (Chapter 8 exercise sheet); algorithm of DSC 7th ed., §14.3.3", draw: (s) => {
          L.text(s, "Insert 31: the leaf [29, 31] is new, so the root needs key 29 and would hold [5 | 11 | 19 | 29] with 5 pointers", X0, 1.35, CW, 0.8, { fontSize: 20, color: HEX.ink });
          tree(s, [[[2, 3], [5, 7], [11, 17], [19, 23], [29, 31]], [{ keys: [5, 11], kids: 3 }, { keys: [29], kids: 2 }], [{ keys: [19], kids: 2 }]], { x0: 1.4, yLeaf: 4.85, dy: 1.25, cw: 0.85, gap: 0.45, hl: ["2:0"] });
          L.text(s, "Non-leaf split: keep ⌈5/2⌉ = 3 pointers; the middle key 19 moves up (it is not copied) into a new root: height 3.", X0, 5.75, CW, 0.8, { fontSize: 20, color: HEX.grey });
        } },
        { k: "cards", h: "14.3 Deletion: the main idea", src: src("§14.3.3 (deletion)"), cards: [
          ["Remove", "Delete the entry from its leaf; done if the leaf is still at least half full"],
          ["Redistribute", "If a sibling has spare entries, borrow one and fix the key in the parent"],
          ["Coalesce", "Otherwise merge with a sibling and delete one entry from the parent"],
          ["Propagate", "The parent may underflow in turn; a root with one child is removed, so the height shrinks", HEX.paleOrange]] },
        { k: "bul", h: "B+-tree file organization; non-unique keys", src: "Source: DSC 7th ed., §14.3.5 (non-unique keys); self-study §14.4.1 (B+-tree file organization)", items: [
          "The leaves can store the records themselves: a B+-tree file organization",
          "This is a clustered index in SQL Server: rows live in the leaf pages",
          "Non-unique search key: DSC makes it unique by appending a uniquifier, e.g. the primary key",
          "Example: an index on dept_name stores (dept_name, ID)"],
          right: { card: ["SQL Server", ["A table with a clustered index is a B+-tree file", "A table without one is a heap", "Nonclustered index leaves hold the clustered key"]] } },
        { k: "bul", h: "14.5 Static hashing", src: src("§14.5"), items: [
          "A hash function h maps search-key values to a fixed set of buckets",
          "A bucket is one or more blocks of entries",
          "Equality lookup: compute h(v), read one bucket",
          "A full bucket gets overflow buckets, chained to it",
          "Skew or growth make chains long: lookups slow down"],
          right: { card: ["A good hash function", ["Uniform: each bucket gets about the same number of keys", "Random: independent of patterns in the keys"]] } },
        { k: "draw", h: "Static hashing with overflow", src: "Example written for IDB201; static hashing of DSC 7th ed., §14.5", draw: (s) => {
          L.text(s, "h(K) = K mod 5; 2 entries per bucket; insert 3, 8, 13, 7, 12, 25", X0, 1.35, CW, 0.5, { fontSize: 20, bold: true, color: HEX.navy });
          buckets(s, 5, 2, [3, 8, 13, 7, 12, 25], (k) => k % 5, X0, 2.05);
          L.autoCard(s, 7.6, 2.05, 5.1, 3.4, "What happens", ["3, 8 and 13 all hash to bucket 3: it overflows", "Buckets 1 and 4 stay empty: skew", "A lookup of 13 reads two blocks"], "skew", { fill: HEX.pale, size: 20 });
          L.text(s, "Dynamic hashing (extendable, linear) grows the number of buckets: beyond this course.", X0, 5.75, CW, 0.6, { fontSize: 20, color: HEX.grey });
        } },
        { k: "table", h: "Choosing an access structure", src: src("§14.3, §14.5 and §15.3"), size: 20, rowH: 0.78, colW: [4.1, 2.6, 2.6, 2.83], rows: [
          ["Query", "B+-tree", "Hash index", "Scan"],
          ["where ID = 'I3001'", "good", "best", "poor"],
          ["where salary between 60000 and 80000", "good", "useless", "poor"],
          ["order by name", "good", "useless", "sort needed"],
          ["Most rows of the table", "poor", "poor", "best"]],
          note: "Every index also costs space and slows down every insert, update and delete." },
        { k: "code", h: "14.7 Creation of indices", src: src("§14.7") + "; " + SQLS, codeW: 7.6, code:
"create index dept_index\n    on instructor (dept_name);\n\ncreate unique index ins_name\n    on instructor (name);   -- rejects duplicates\n\n-- SQL Server forms\ncreate nonclustered index ix_takes_course\n    on takes (course_id) include (grade);\n\ndrop index dept_index on instructor;",
          items: ["The SQL standard has no create index; all systems offer it", "The primary key gets an index automatically", "include stores extra columns in the leaves"] },
        { k: "cards", h: "Indices in SQL Server", src: SQLS, cards: [
          ["Clustered", "One per table; by default on the primary key; the rows are its leaves"],
          ["Nonclustered", "Up to 999 per table; leaves hold the key and a row locator"],
          ["Covering", "With include, a query can be answered from the index alone"],
          ["Hash", "Only for memory-optimized tables; ordinary indexes are B+-trees", HEX.paleOrange]] },
        { k: "quick", h: "Quick check: session 42", src: "Questions written for IDB201 on DSC 7th ed., §14.3–14.7",
          qs: ["Why does a B+-tree grow at the root and not at the leaves?",
               "Can a hash index on salary answer salary > 80000? Why or why not?",
               "Give one reason not to create an index on every column of takes."],
          ans: "1 so that all leaves stay at the same depth: the tree stays balanced; 2 no, the hash value does not preserve order, so every bucket must be read; 3 each index slows down every insert, update and delete, and uses space." },
      ] },
    // ------------------------------------------------------------ 43
    { n: 43, name: "Guided exercises", sum: "B+-tree insertion by hand; hashing; I/O cost of index lookups versus scans; CQ8.1–CQ8.3",
      slides: [
        { k: "plan", h: "Plan of session 43", src: "IDB201 syllabus, session 43; Chapter 8 exercise sheet", rows: [
          ["Exercise 1", "B+-tree insertion by hand", "12 min"],
          ["Exercise 2", "Static hashing", "8 min"],
          ["Exercise 3", "Index lookup versus table scan", "10 min"],
          ["CQ8.1–CQ8.3", "Discussion in groups, then whole class", "13 min", true],
          ["Next", "Chapter 9 in session 44", "2 min"]] },
        { k: "bul", h: "Exercise 1: B+-tree insertion by hand", src: "Exercise written for IDB201 (Chapter 8 exercise sheet); DSC 7th ed., §14.3.3", items: [
          "n = 4: at most 3 keys per node",
          "Start from an empty tree and insert, in this order: 2, 3, 5, 7, 11, 17, 19, 23, 29, 31",
          "Draw the tree after every split",
          "Then repeat with n = 6 and compare the heights"],
          bottom: "Hint: splits happen when you insert 7, 17, 23 and 31." },
        { k: "draw", h: "Exercise 1: solution (n = 4)", src: "Solution written for IDB201; algorithm of DSC 7th ed., §14.3.3", draw: (s) => {
          tree(s, [[[2, 3], [5, 7], [11, 17], [19, 23], [29, 31]], [{ keys: [5, 11], kids: 3 }, { keys: [29], kids: 2 }], [{ keys: [19], kids: 2 }]], { x0: 1.4, yLeaf: 4.2, dy: 1.3, cw: 0.85, gap: 0.45 });
          L.autoCard(s, X0, 5.15, CW, 1.45, null, ["Height 3 after 10 keys. With n = 6 (5 keys per node) the same keys need only two levels: the root [7 | 19] over leaves [2, 3, 5], [7, 11, 17], [19, 23, 29, 31]."], "ex1", { fill: HEX.paleOrange, size: 20 });
        } },
        { k: "bul", h: "Exercise 2: static hashing", src: "Exercise written for IDB201 (Chapter 8 exercise sheet); DSC 7th ed., §14.5", items: [
          "A hash file has 8 buckets, h(K) = K mod 8, 2 entries per bucket",
          "Insert 3, 11, 19, 8, 16, 27, 5 and draw the buckets with their overflow chains",
          "Which buckets overflow? What does this say about h for these keys?",
          "Why can this index not answer K between 5 and 15?"] },
        { k: "draw", h: "Exercise 2: solution", src: "Solution written for IDB201; DSC 7th ed., §14.5", draw: (s) => {
          buckets(s, 8, 2, [3, 11, 19, 8, 16, 27, 5], (k) => k % 8, X0, 1.45, { rh: 0.5 });
          L.autoCard(s, 7.6, 1.45, 5.1, 5.1, "Answers", ["Bucket 3 holds 3, 11 and overflows with 19, 27: all four keys are 3 mod 8", "Six buckets get almost nothing: h fits these keys badly", "Range query: 5 ≤ K ≤ 15 maps to scattered buckets, so every bucket must be read"], "ex2", { fill: HEX.pale, size: 20 });
        } },
        { k: "table", h: "Exercise 3: index lookup versus table scan", src: "Exercise written for IDB201; cost model of DSC 7th ed., §15.2–15.3 (seeks ignored)", size: 20, rowH: 0.72, colW: [4.6, 4.0, 3.53],
          intro: "r: 100,000 tuples, 100 per block, so br = 1,000 blocks. Secondary B+-tree index of height 3.",
          rows: [
          ["Query", "Index (block transfers)", "Table scan"],
          ["Equality on a key: 1 tuple", "3 + 1 = 4", "500 on average"],
          ["50 matching tuples", "about 3 + 50 = 53", "1,000"],
          ["5,000 matching tuples", "about 3 + 5,000 = 5,003", "1,000"]],
          note: "A secondary index may need one block per matching tuple, in the worst case." },
        { k: "draw", h: "Where the index stops paying off", src: "Computed for IDB201 from Exercise 3; cost model of DSC 7th ed., §15.3 (A1, A4)", draw: (s) => {
          const labels = ["0", "250", "500", "750", "1000", "1250", "1500"];
          s.addChart("line", [
            { name: "Secondary index: 3 + n", labels, values: labels.map((v) => 3 + Number(v)) },
            { name: "Linear scan: 1,000", labels, values: labels.map(() => 1000) }],
            { x: X0, y: 1.4, w: 8.2, h: 5.2, chartColors: [HEX.orange, HEX.navy], lineSize: 3, lineDataSymbol: "none",
              showLegend: true, legendPos: "b", legendFontSize: 18, legendFontFace: "Arial",
              catAxisLabelFontSize: 18, valAxisLabelFontSize: 18, catAxisLabelFontFace: "Arial", valAxisLabelFontFace: "Arial",
              catAxisLabelColor: HEX.grey, valAxisLabelColor: HEX.grey, valGridLine: { color: "D5DCE3", size: 1 }, catGridLine: { style: "none" },
              showCatAxisTitle: true, catAxisTitle: "matching tuples n", catAxisTitleFontSize: 18, catAxisTitleColor: HEX.grey,
              showValAxisTitle: true, valAxisTitle: "block transfers", valAxisTitleFontSize: 18, valAxisTitleColor: HEX.grey });
          L.autoCard(s, 9.1, 1.4, 3.6, 5.2, "Break-even", ["3 + n = 1,000 at n = 997", "About 1% of the 100,000 tuples", "Above that, the scan wins: CQ8.2"], "be", { fill: HEX.paleOrange, size: 20 });
        } },
        { k: "code", h: "Exercise 4: an index for a query", src: "Exercise written for IDB201 on the course database University (givenDB); " + SQLS, codeW: 7.4, code:
"-- which students took CS-315, with grades?\nselect ID, grade\nfrom   takes\nwhere  course_id = 'CS-315';\n\n-- a covering index\ncreate nonclustered index\n    ix_takes_course_grade\n    on takes (course_id)\n    include (grade);",
          card: ["Discuss", ["The result has 4 rows on University", "Why is ID not listed in include?", "Answer: ID is in the clustered primary key of takes, so every index row already carries it", "Check the plan in Lab 5: Index Seek instead of a scan"]] },
        { k: "cq", id: "CQ8.1", look: "Where to look: DSC 7th ed., §14.3 (height analysis); self-study §12.6", prompts: [
          "What does one block transfer cost compared with processing a node in memory?",
          "Compare log2 N with log50 N for N = 1,000,000",
          "What happens to the fan-out if nodes are small?"] },
        { k: "cq", id: "CQ8.2", look: "Where to look: DSC 7th ed., §14.2, §15.3; Lab 5 part 1", prompts: [
          "Use Exercise 3: where is the break-even point?",
          "Does a clustering index change the answer?",
          "In SQL Server: set statistics io on and compare logical reads"] },
        { k: "cq", id: "CQ8.3", look: "Where to look: DSC 7th ed., §14.3; Kraska et al., The case for learned index structures, SIGMOD 2018", prompts: [
          "An index maps a key to a position: what would a model predict?",
          "Measure lookup time, accuracy, size and the cost of updates",
          "What does a B+-tree guarantee that a model does not?"] },
      ] },
  ],
  back: [
    { k: "list", h: "Practice exercises", src: "Exercises written for IDB201; more: the Chapter 8 exercise sheet and DSC Practice Exercises 14.1–14.6, pp. 679–680", items: [
      "A B+-tree with n = 4 has root [30 | 50] and leaves [10, 20], [30, 40], [50, 60]. Insert 25, then 22. Draw the result.",
      "A file has 100,000 records, 20 per block. How many blocks does a linear scan read for an equality condition on a key attribute and on a non-key attribute?",
      "In the B+-tree on instructor.name, a new instructor named Ngo is inserted. Which leaf receives it, and does any node split?"] },
    { k: "list", h: "Practice exercises: answers", src: "Answers written for IDB201 on DSC 7th ed., §14.3 and §15.3", fill: HEX.pale, items: [
      "25 goes to [10, 20, 25], no split. 22 overflows it: leaves [10, 20] and [22, 25]; 22 enters the root: [22 | 30 | 50].",
      "5,000 blocks in all. Non-key: all 5,000. Key: stop at the first match, 2,500 on average and 5,000 in the worst case (DSC §15.3, A1).",
      "Ngo < Nguyen, so P1 from the root; Ngo > Le, so the last pointer: leaf [Le, Mendel] becomes [Le, Mendel, Ngo]. No split: the leaf had room."] },
    { k: "cards", h: "Summary", src: "DSC 7th ed., Ch. 13–14", cols: 3, num: false, cards: [
      ["Blocks", "The unit of storage and of cost"],
      ["Records and files", "Slotted pages; heap, sequential, clustering"],
      ["Buffer", "Replacement, pinning, forced output"],
      ["Ordered indices", "Clustering or secondary; dense or sparse"],
      ["B+-trees", "Balanced, high fan-out, logarithmic height"],
      ["Hashing", "Equality only; an index is not always cheaper than a scan", HEX.paleOrange]] },
    { k: "cards", h: "Before the next session", src: "IDB201 syllabus, sessions 43–48", cards: [
      ["Within one week", "Choose one of CQ8.1–CQ8.3 and submit your answer on the LMS"],
      ["Session 44", "Read DSC Ch. 15, §15.1–15.4, pp. 689–703", HEX.paleOrange],
      ["Self-study", "§14.4 B+-tree extensions, §14.6 multiple-key access; optional §13.6, §14.8"]] },
  ],
};

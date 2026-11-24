// Chapter 7 – Relational database design: functional dependencies and normal forms (sessions 32–38)
// Proofs and NP-completeness are not part of the course (council review, 18 Nov 2026): derivations and examples only.
const L = require("../lib");
const { HEX, X0, CW } = L;
const src = (x) => `Source: DSC 7th ed., ${x}`;
const ex = (x) => `Example written for IDB201; DSC 7th ed., ${x}`;

function tree(s, root, kids, note, o = {}) {
  // root at top, children below with arrows; kids: [[label, sub?]]
  const rx = o.rx || 3.2, rw = o.rw || 4.6;
  L.node(s, root, rx, 1.5, rw, 0.8, { mono: true, size: 18 });
  if (o.via) L.text(s, o.via, rx + rw + 0.2, 1.6, 4.4, 0.6, { fontSize: 18, color: HEX.orange, bold: true });
  const n = kids.length, kw = o.kw || 3.6, gap = (CW - n * kw) / (n + 1);
  kids.forEach((k, i) => {
    const x = X0 + gap + i * (kw + gap);
    L.node(s, k[0], x, 3.0, kw, 0.8, { mono: true, size: 18, fill: k[1] ? HEX.white : "E3F1E8", lineColor: k[1] ? HEX.navy : HEX.green, color: k[1] ? HEX.navy : HEX.green });
    L.arrow(s, rx + rw / 2, 2.3, x + kw / 2, 3.0);
    if (k[1]) {
      if (k[2]) L.text(s, k[2], x + kw + 0.1, 3.15, 2.4, 0.5, { fontSize: 18, color: HEX.orange, bold: true });
      k[1].forEach((g, j) => {
        const gx = x - 0.9 + j * (kw / 2 + 0.9), gw = kw / 2 + 0.5;
        L.node(s, g, gx, 4.55, gw, 0.8, { mono: true, size: 18, fill: "E3F1E8", lineColor: HEX.green, color: HEX.green });
        L.arrow(s, x + kw / 2, 3.8, gx + gw / 2, 4.55);
      });
    }
  });
  if (note) L.autoCard(s, X0, 5.6, CW, 1.0, null, note, "tree", { fill: HEX.paleOrange, size: 20 });
}

module.exports = {
  n: 7,
  title: "Relational database design: functional dependencies and normal forms",
  textbook: "DSC Ch. 7, §7.1–7.6 and §7.8, pp. 303–342; exercises pp. 353–359; self-study §7.7, §7.9.",
  clos: ["CLO5"],
  objectives: [
    "Identify the update, insertion and deletion anomalies caused by redundancy",
    "Use Armstrong's axioms and attribute closure to decide whether an FD follows from F",
    "Find candidate keys and canonical covers",
    "Test BCNF and 3NF, and decompose schemas with the BCNF and 3NF algorithms",
    "Check whether a decomposition is lossless and dependency preserving",
  ],
  roadNote: "Session 39: project milestone 1 (design review, graded)",
  sessions: [
    { n: 32, name: "Good designs", sum: "7.1 redundancy and anomalies; 7.2 decomposition, functional dependencies",
      slides: [
        { k: "table", h: "7.1 A bad design: instructor ⋈ department", src: "Rows of the course database University (givenDB) combined; DSC 7th ed., §7.1", size: 20, rowH: 0.62, colW: [1.5, 1.6, 1.6, 2.6, 2.0, 2.83], mono: true, rows: [
          ["ID", "name", "salary", "dept_name", "building", "budget"],
          ["I3001", "Curie", "95000", "Physics", "Gamma", "85000"], ["I3002", "Bohr", "83000", "Physics", "Gamma", "85000"],
          ["I1002", "Tran", "78000", "Comp. Sci.", "Alpha", "120000"], ["I1003", "Le", "65000", "Comp. Sci.", "Alpha", "120000"]],
          note: "in_dep repeats the building and budget of a department for every one of its instructors." },
        { k: "cards", h: "7.1 Problems caused by redundancy", src: src("§7.1"), cards: [
          ["Update anomaly", "Changing the Physics budget means changing every Physics row; missing one makes the data inconsistent"],
          ["Insertion anomaly", "Philosophy has no instructor: it cannot be stored without nulls for the instructor attributes"],
          ["Deletion anomaly", "Deleting the last instructor of a department also deletes its building and budget"]] },
        { k: "draw", h: "7.1 The cure: decomposition", src: ex("§7.1"), draw: (s) => {
          L.node(s, "in_dep(ID, name, salary, dept_name, building, budget)", 1.8, 1.6, 9.7, 0.9, { mono: true, size: 20 });
          L.node(s, "instructor(ID, name, salary, dept_name)", 0.7, 3.6, 5.8, 0.9, { mono: true, size: 18, fill: "E3F1E8", lineColor: HEX.green, color: HEX.green });
          L.node(s, "department(dept_name, building, budget)", 6.9, 3.6, 5.8, 0.9, { mono: true, size: 18, fill: "E3F1E8", lineColor: HEX.green, color: HEX.green });
          L.arrow(s, 6.65, 2.5, 3.6, 3.6); L.arrow(s, 6.65, 2.5, 9.8, 3.6);
          L.autoCard(s, X0, 5.0, CW, 1.5, null, "Each department fact is now stored once. The question of this chapter: when is such a split safe and complete?", "cure", { fill: HEX.paleOrange });
        } },
        { k: "cards", h: "Lossless and lossy decompositions", src: src("§7.1.2"), cards: [
          ["Decomposition", "Replace R by R1 and R2 with R = R1 ∪ R2"],
          ["Lossless", "For every legal instance r: Π R1 (r) ⋈ Π R2 (r) = r"],
          ["Lossy", "The join returns extra (spurious) tuples: we no longer know which tuples were in r", HEX.paleOrange]] },
        { k: "draw", h: "A lossy decomposition", src: ex("§7.1.2"), draw: (s) => {
          L.text(s, "employee", 0.7, 1.45, 4, 0.45, { bold: true, color: HEX.navy, fontSize: 20 });
          L.table(s, [["ID", "name", "city"], ["57766", "Kim", "Hanoi"], ["98776", "Kim", "Hue"]], 0.7, 1.95, 4.8, { mono: true, size: 20, rowH: 0.55 });
          L.text(s, "split into (ID, name) and (name, city), then join on name:", 0.7, 3.8, 5.3, 0.9, { fontSize: 20 });
          L.table(s, [["ID", "name", "city"], ["57766", "Kim", "Hanoi"], ["57766", "Kim", "Hue"], ["98776", "Kim", "Hanoi"], ["98776", "Kim", "Hue"]], 6.6, 1.95, 4.8, { mono: true, size: 20, rowH: 0.55 });
          L.text(s, "spurious", 11.5, 2.55, 1.3, 0.45, { fontSize: 18, color: HEX.red, bold: true });
          L.text(s, "spurious", 11.5, 3.1, 1.3, 0.45, { fontSize: 18, color: HEX.red, bold: true });
          L.autoCard(s, X0, 5.1, CW, 1.45, null, "More tuples, less information: two employees with the same name can no longer be told apart.", "lossy", { fill: HEX.paleOrange });
        } },
        { k: "code", h: "7.2 Functional dependencies", src: src("§7.2.1"), codeW: 6.8, code:
"α → β holds on R if, for all\nlegal instances and all tuples\nt1, t2:\n\n  t1[α] = t2[α]  ⇒  t1[β] = t2[β]",
          items: ["An FD is a constraint on every legal instance", "K is a superkey of R iff K → R", "Trivial: α → β with β ⊆ α"] },
        { k: "draw", h: "The FDs of in_dep", src: ex("§7.2"), draw: (s) => {
          const at = ["ID", "name", "salary", "dept_name", "building", "budget"];
          at.forEach((a, i) => L.node(s, a, 0.7 + i * 2.05, 2.6, 1.85, 0.8, { mono: true, size: 18, fill: i === 0 || i === 3 ? HEX.paleOrange : HEX.white }));
          // ID -> name, salary, dept_name (arcs above)
          const cx = (j) => 0.7 + j * 2.05 + 0.92;
          L.arrow(s, cx(0), 2.6, cx(0), 2.2, { noHead: true }); L.arrow(s, cx(0), 2.2, cx(3), 2.2, { noHead: true });
          [1, 2, 3].forEach((j) => L.arrow(s, cx(j), 2.2, cx(j), 2.6));
          L.arrow(s, cx(3), 3.4, cx(3), 3.8, { noHead: true, color: HEX.orange }); L.arrow(s, cx(3), 3.8, cx(5), 3.8, { noHead: true, color: HEX.orange });
          [4, 5].forEach((j) => L.arrow(s, cx(j), 3.8, cx(j), 3.4, { color: HEX.orange }));
          L.text(s, "ID → name, salary, dept_name", 0.7, 1.55, 7.0, 0.5, { fontSize: 20, bold: true, color: HEX.navy, fontFace: L.CODE });
          L.text(s, "dept_name → building, budget", 6.3, 4.0, 6.4, 0.5, { fontSize: 20, bold: true, color: HEX.orange, fontFace: L.CODE });
          L.autoCard(s, X0, 5.0, CW, 1.5, null, "The second FD has a left side that is not a key of in_dep: this is the source of the redundancy.", "fds", { fill: HEX.pale });
        } },
        { k: "cards", h: "7.2 Closure and keys", src: src("§7.2"), cards: [
          ["Closure F⁺", "All FDs logically implied by F"],
          ["Superkey", "K → R is in F⁺"],
          ["Candidate key", "A minimal superkey"],
          ["Lossless test", "{R1, R2} is lossless if R1 ∩ R2 → R1 or R1 ∩ R2 → R2 is in F⁺", HEX.paleOrange]] },
        { k: "table", h: "An instance cannot prove an FD", src: "Instance from the course database University; DSC 7th ed., §7.2", size: 20, rowH: 0.6, colW: [1.6, 1.8, 2.6], w: 6.0, mono: true, rows: [
          ["ID", "name", "dept_name"], ["I3001", "Curie", "Physics"], ["I4001", "Mendel", "Biology"], ["I5001", "Keynes", "Economics"]],
          right: { x: 7.0, w: 5.7, card: ["Question", ["Here name → dept_name happens to hold", "Does it hold on the schema?", "No: a second Curie in Biology is a legal tuple. FDs come from the meaning of the data"]] } },
        { k: "quick", h: "Quick check: session 32", src: "Questions written for IDB201 on DSC 7th ed., §7.1–7.2",
          qs: ["Philosophy has no instructor. Which anomaly does in_dep show for it?",
               "Is the split of in_dep into instructor and department lossless? Why?",
               "Can the University data prove that dept_name → building holds?"],
          ans: "1 insertion anomaly; 2 yes, the common attribute dept_name is a key of department; 3 no, an instance can only refute an FD." },
      ] },
    { n: 33, name: "Normal forms", sum: "7.3 Boyce–Codd normal form and third normal form",
      slides: [
        { k: "bul", h: "7.3 Boyce–Codd normal form (BCNF)", src: src("§7.3.1"), items: [
          "R is in BCNF if, for every α → β in F⁺ with α ∪ β ⊆ R:",
          { t: "α → β is trivial (β ⊆ α), or", lvl: 1 },
          { t: "α is a superkey of R", lvl: 1 },
          "in_dep is not in BCNF: dept_name → building, budget, but dept_name is not a superkey"],
          right: { card: ["In words", "Every non-trivial FD must start from a key: then nothing is repeated."] } },
        { k: "code", h: "7.3 Decomposing into BCNF", src: src("§7.3.1"), codeW: 7.8, code:
"for a violating α → β, replace R by\n  (α ∪ β) and (R − (β − α))\n\nin_dep, dept_name → building, budget:\n  (dept_name, building, budget)\n  (ID, name, salary, dept_name)",
          card: ["Why lossless", "The two schemas share α, and α → α ∪ β: the lossless test of §7.2 holds."] },
        { k: "draw", h: "7.3 BCNF decomposition of in_dep", src: ex("§7.3.1"), draw: (s) => {
          tree(s, "in_dep", [["(dept_name, building, budget)"], ["(ID, name, salary, dept_name)"]], "Both results are in BCNF: their only non-trivial FDs start from their keys.", { rx: 4.3, rw: 4.6, kw: 5.4, via: "dept_name → building, budget" });
        } },
        { k: "code", h: "7.3 BCNF and dependency preservation", src: src("§7.3.2"), codeW: 7.8, code:
"dept_advisor(s_ID, i_ID, dept_name)\n\nF = { i_ID → dept_name,\n      s_ID, dept_name → i_ID }",
          items: ["An instructor belongs to one department", "A student has at most one advisor per department", "Candidate keys: (s_ID, dept_name), (s_ID, i_ID)"] },
        { k: "draw", h: "7.3 BCNF can lose a dependency", src: ex("§7.3.2"), draw: (s) => {
          tree(s, "dept_advisor(s_ID, i_ID, dept_name)", [["(s_ID, i_ID)"], ["(i_ID, dept_name)"]], "No schema contains s_ID, dept_name and i_ID: s_ID, dept_name → i_ID can only be checked with a join.", { rx: 3.0, rw: 7.3, kw: 4.0, via: "" });
          L.text(s, "i_ID → dept_name violates BCNF", 7.6, 2.4, 5.0, 0.5, { fontSize: 18, color: HEX.orange, bold: true });
        } },
        { k: "bul", h: "7.3 Third normal form (3NF)", src: src("§7.3.2"), items: [
          "R is in 3NF if, for every α → β in F⁺:",
          { t: "α → β is trivial, or", lvl: 1 }, { t: "α is a superkey of R, or", lvl: 1 },
          { t: "each attribute in β − α is in some candidate key", lvl: 1 },
          "dept_advisor is in 3NF: dept_name is part of the key (s_ID, dept_name)"],
          right: { card: ["The price", "Some redundancy can remain (dept_name repeated for an instructor), and nulls may be needed."] } },
        { k: "table", h: "Comparing BCNF and 3NF", src: src("§7.3.3"), size: 22, rowH: 0.78, colW: [5.6, 3.2, 3.33], rows: [
          ["Property", "BCNF", "3NF"],
          ["Redundancy due to FDs", "eliminated", "may remain"],
          ["Lossless decomposition always possible", "yes", "yes"],
          ["Dependency preservation always possible", "no", "yes"],
          ["Testing one schema", "with α⁺ only", "needs candidate keys"]],
          note: "Goal: BCNF, lossless, dependency preserving. When impossible, choose (CQ7.2)." },
        { k: "cards", h: "Normal forms as levels", src: src("§7.3, §7.6, §7.8"), num: false, cols: 4, cards: [
          ["1NF", "Atomic domains (§7.8)"], ["3NF", "Relaxed BCNF; always dependency preserving"], ["BCNF", "No FD redundancy"], ["4NF", "No MVD redundancy (§7.6)", HEX.paleOrange]],
          note: "Each level contains the next: every 4NF schema is in BCNF, every BCNF schema in 3NF." },
        { k: "quick", h: "Quick check: session 33", src: "Questions written for IDB201 on DSC 7th ed., §7.3",
          qs: ["R(A, B, C) with F = { A → B }. Is R in BCNF?",
               "Is every BCNF schema in 3NF? Is every 3NF schema in BCNF?",
               "Is dept_advisor in BCNF? In 3NF?"],
          ans: "1 no, the key is AC and A → B starts from a non-superkey; 2 yes; no; 3 not BCNF, but 3NF." },
      ] },
    { n: 34, name: "FD theory (1)", sum: "7.4 closure, Armstrong's axioms, attribute closure",
      slides: [
        { k: "cards", h: "7.4 Why reason about FDs?", src: src("§7.4.1"), cards: [
          ["Implied FDs", "From A → B and B → C, A → C also holds, though nobody wrote it"],
          ["Tests need F⁺", "BCNF, keys and lossless joins are defined on F⁺"],
          ["Tools", "Armstrong's axioms (rules) and attribute closure (an algorithm)", HEX.paleOrange]] },
        { k: "table", h: "Armstrong's axioms", src: src("§7.4.1"), size: 22, rowH: 0.75, colW: [3.3, 5.6, 3.23], rows: [
          ["Rule", "Statement", "Status"],
          ["Reflexivity", "If β ⊆ α, then α → β", "axiom"], ["Augmentation", "If α → β, then γα → γβ", "axiom"],
          ["Transitivity", "If α → β and β → γ, then α → γ", "axiom"],
          ["Union", "α → β, α → γ give α → βγ", "derived"], ["Decomposition", "α → βγ gives α → β", "derived"]],
          note: "The axioms derive only FDs that hold (sound) and all of them (complete)." },
        { k: "code", h: "Using the axioms: a derivation", src: ex("§7.4.1"), codeW: 7.4, code:
"F = { A → B, BC → D }; show AC → D\n\n1. A → B          given\n2. AC → BC        augment 1 with C\n3. BC → D         given\n4. AC → D         transitivity 2, 3",
          items: ["This is the pseudotransitivity rule", "In practice we do not search for derivations: attribute closure decides"] },
        { k: "code", h: "Deriving the union rule", src: ex("§7.4.1"), codeW: 7.4, code:
"given α → β and α → γ\n\n1. α → αβ     augment α → β with α\n2. αβ → βγ    augment α → γ with β\n3. α → βγ     transitivity 1, 2",
          items: ["Every step uses an axiom", "Decomposition and pseudotransitivity are derived the same way"] },
        { k: "code", h: "7.4 The attribute-closure algorithm", src: src("§7.4.2"), codeW: 7.0, code:
"result := α;\nrepeat\n  for each β → γ in F do\n    if β ⊆ result then\n      result := result ∪ γ;\nuntil result does not change;\nreturn result;   -- α⁺",
          items: ["α⁺: all attributes determined by α", "Polynomial in the size of F", "No need to compute F⁺"] },
        { k: "table", h: "Attribute closure: an example", src: src("§7.4.2"), size: 22, rowH: 0.7, colW: [2.0, 5.0, 5.13], rows: [
          ["Step", "FD used", "result"], ["0", "start", "AG"], ["1", "A → B, A → C", "ABCG"], ["2", "CG → H, CG → I", "ABCGHI"], ["3", "nothing new", "stop"]],
          intro: "R(A, B, C, G, H, I), F = { A → B, A → C, CG → H, CG → I, B → H }. Compute (AG)⁺.",
          note: "(AG)⁺ = R, while A⁺ and G⁺ are not: AG is a candidate key." },
        { k: "cards", h: "What attribute closure is used for", src: src("§7.4.2"), cards: [
          ["Superkey test", "α is a superkey iff α⁺ contains all attributes of R"],
          ["FD test", "α → β is in F⁺ iff β ⊆ α⁺"],
          ["Computing F⁺", "For every γ ⊆ R, compute γ⁺: exponential, rarely needed", HEX.paleOrange]] },
        { k: "cards", h: "Finding all candidate keys", src: ex("§7.4.2"), cards: [
          ["Step 1", "Attributes on no right side must be in every key"],
          ["Step 2", "Compute closures of small sets that contain them"],
          ["Step 3", "Keep the minimal sets whose closure is R"]],
          note: "R(A, B, C, D), F = { AB → C, C → D, D → A }: B is in every key; the keys are AB, BC and BD." },
        { k: "quick", h: "Quick check: session 34", src: "Questions written for IDB201 on DSC 7th ed., §7.4",
          qs: ["F = { A → B, B → C }. Does A → C follow? Use attribute closure.",
               "Is the union rule an axiom?",
               "R(A, B, C, D), F = { A → B, B → C }. What is A⁺, and what is the candidate key?"],
          ans: "1 yes, A⁺ = ABC; 2 no, it is derived from the axioms; 3 A⁺ = ABC, the key is AD." },
      ] },
    { n: 35, name: "FD theory (2)", sum: "Canonical cover; lossless decomposition; dependency preservation",
      slides: [
        { k: "cards", h: "7.4 Extraneous attributes", src: src("§7.4.3"), cards: [
          ["In a left side", "A ∈ α is extraneous if F implies (α − A) → β: test whether β ⊆ (α − A)⁺ under F"],
          ["In a right side", "A ∈ β is extraneous if α → (β − A) with the rest of F implies A: test whether A ∈ α⁺ under the new set"],
          ["Why remove them", "Smaller FDs make tests and algorithms simpler", HEX.paleOrange]] },
        { k: "code", h: "Testing for extraneous attributes", src: src("§7.4.3"), codeW: 8.4, code:
"F = { A → BC, B → C, A → B, AB → C }\n\nB in AB → C?  A⁺ under F = ABC ⊇ C\n              → B is extraneous\nC in A → BC?  with A → B instead:\n              A⁺ = AB, then B → C\n              gives ABC ∋ C\n              → C is extraneous",
          items: ["Test one attribute at a time", "Recompute after each removal"] },
        { k: "code", h: "7.4 The canonical-cover algorithm", src: src("§7.4.3"), codeW: 7.4, code:
"Fc := F;\nrepeat\n  union FDs with the same left side:\n    α → β1, α → β2  become  α → β1β2;\n  find an FD with an extraneous\n    attribute and remove it;\nuntil Fc does not change;",
          items: ["Fc is equivalent to F", "No extraneous attributes", "Each left side appears once"] },
        { k: "table", h: "Canonical cover: an example", src: src("§7.4.3"), size: 22, rowH: 0.72, colW: [5.2, 6.93], rows: [
          ["Step", "Set of FDs"], ["start", "A → BC, B → C, A → B, AB → C"], ["union A → BC and A → B", "A → BC, B → C, AB → C"],
          ["B extraneous in AB → C: A → C, merged", "A → BC, B → C"], ["C extraneous in A → BC", "A → B, B → C"]],
          note: "Fc = { A → B, B → C }" },
        { k: "bul", h: "7.4 Testing for lossless decomposition", src: src("§7.4.4"), items: [
          "{R1, R2} is lossless if R1 ∩ R2 → R1 or R1 ∩ R2 → R2 is in F⁺",
          "Compute (R1 ∩ R2)⁺ and check whether it contains R1 or R2",
          "R(A, B, C), F = { A → B }: (A, B), (A, C) share A, and A → AB: lossless"],
          right: { card: ["Remember", "The common attributes must be a superkey of one of the two schemas."] } },
        { k: "draw", h: "A lossy split, checked on an instance", src: ex("§7.4.4"), draw: (s) => {
          L.text(s, "r(A, B, C), F = { A → B }", 0.7, 1.45, 6, 0.5, { fontSize: 20, bold: true, color: HEX.navy, fontFace: L.CODE });
          L.table(s, [["A", "B", "C"], ["1", "x", "p"], ["2", "x", "q"]], 0.7, 2.05, 3.6, { mono: true, size: 20, rowH: 0.55 });
          L.text(s, "split (A, B), (B, C); join on B", 4.6, 2.3, 3.0, 0.9, { fontSize: 20, align: "center" });
          L.table(s, [["A", "B", "C"], ["1", "x", "p"], ["1", "x", "q"], ["2", "x", "p"], ["2", "x", "q"]], 8.0, 2.05, 3.6, { mono: true, size: 20, rowH: 0.55 });
          L.text(s, "spurious: (1, x, q), (2, x, p)", 8.0, 4.9, 4.7, 0.45, { fontSize: 18, color: HEX.red, bold: true });
          L.autoCard(s, X0, 5.5, CW, 1.05, null, "B → AB? B⁺ = B: the test fails, and the instance shows the lost information.", "lossy2", { fill: HEX.paleOrange, size: 22 });
        } },
        { k: "cards", h: "7.4 Dependency preservation", src: src("§7.4.5"), cards: [
          ["Restriction Fi", "The FDs of F⁺ that use only attributes of Ri: checkable inside Ri"],
          ["Preserving", "(F1 ∪ … ∪ Fn)⁺ = F⁺"],
          ["Why it matters", "An FD that is not preserved needs a join to be checked on every update", HEX.paleOrange]] },
        { k: "code", h: "Testing dependency preservation", src: src("§7.4.5"), codeW: 7.0, code:
"-- is α → β preserved?\nresult := α;\nrepeat\n  for each Ri do\n    t := (result ∩ Ri)⁺ ∩ Ri;\n    result := result ∪ t;\nuntil result does not change;\n-- preserved iff β ⊆ result",
          items: ["R(A, B, C), F = { A → B, B → C }", "(A, B), (A, C): B → C is not preserved", "(A, B), (B, C): both are preserved"] },
        { k: "quick", h: "Quick check: session 35", src: "Questions written for IDB201 on DSC 7th ed., §7.4",
          qs: ["F = { A → B, AB → C }. Is B extraneous in AB → C?",
               "R(A, B, C), F = { A → B }. Is the split (A, B), (B, C) lossless?",
               "R(A, B, C), F = { A → B, B → C }. Does (A, B), (B, C) preserve the dependencies?"],
          ans: "1 yes, A⁺ = ABC contains C; 2 no, B⁺ = B; 3 yes, each FD lies inside one schema." },
      ] },
    { n: 36, name: "Algorithms", sum: "7.5 BCNF decomposition and 3NF synthesis",
      slides: [
        { k: "cards", h: "7.5 Testing BCNF after a split", src: src("§7.5.1.1"), cards: [
          ["Testing R", "Checking the FDs of F is enough"],
          ["Testing a part Ri", "F is not enough: an FD of F⁺ may hide in Ri"],
          ["Test for Ri", "For each α ⊆ Ri, α⁺ contains no attribute of Ri − α, or all of Ri", HEX.paleOrange]] },
        { k: "code", h: "7.5 The BCNF decomposition algorithm", src: src("§7.5.1"), codeW: 7.8, code:
"result := {R}; done := false;\nwhile not done do\n  if some Ri in result is not in BCNF\n  then let α → β be a nontrivial FD\n       on Ri with α → Ri not in F⁺\n       and α ∩ β = ∅;\n       result := (result − Ri)\n               ∪ (Ri − β) ∪ (α, β);\n  else done := true;",
          items: ["Every step is lossless", "The result is in BCNF", "Dependencies may be lost"] },
        { k: "draw", h: "BCNF decomposition: an example", src: "Example written for IDB201 (Chapter 7 exercise sheet, exercises 5–6); algorithm of DSC 7th ed., §7.5.1", draw: (s) => {
          tree(s, "R(A, B, C, D, E)", [["(B, C)"], ["(A, B, D, E)", ["(A, B)", "(A, D, E)"], "A → B violates"]], "F = { A → B, B → C, CD → E }, key AD. Result (B, C), (A, B), (A, D, E): lossless; CD → E is lost.", { rx: 4.2, rw: 4.6, kw: 3.4, via: "B → C violates" });
        } },
        { k: "cards", h: "The order of the violations matters", src: ex("§7.5.1"), cards: [
          ["Start with B → C", "(B, C), (A, B), (A, D, E)"],
          ["Start with A → B", "(A, B), (A, C, D, E), then further splits: a different result"],
          ["Both", "Lossless and in BCNF; the choice affects which FDs survive", HEX.paleOrange]] },
        { k: "code", h: "7.5 The 3NF synthesis algorithm", src: src("§7.5.2"), codeW: 7.8, code:
"let Fc be a canonical cover of F; i := 0;\nfor each α → β in Fc do\n  i := i + 1;  Ri := αβ;\nif no Rj contains a candidate key of R\nthen i := i + 1; Ri := a candidate key;\nremove each Rj contained in another Rk;\nreturn (R1, …, Ri);",
          items: ["Lossless (thanks to the key schema)", "Dependency preserving", "Every Ri is in 3NF"] },
        { k: "cards", h: "3NF synthesis: the DSC example", src: src("§7.5.2"), cards: [
          ["Schema", "cust_banker_branch with customer_id, employee_id, branch_name, type"],
          ["Fc", "customer_id, employee_id → type; employee_id → branch_name; customer_id, branch_name → employee_id"],
          ["Result", "(customer_id, employee_id, type), (customer_id, branch_name, employee_id); (employee_id, branch_name) is contained and removed", HEX.paleOrange]] },
        { k: "table", h: "3NF synthesis: a second example", src: ex("§7.5.2"), size: 22, rowH: 0.7, colW: [5.4, 6.73], rows: [
          ["Step", "Schemas"], ["Fc = { A → B, BC → D, D → E }", "(A, B), (B, C, D), (D, E)"],
          ["Candidate key of R(A, B, C, D, E)", "AC: (AC)⁺ = ABCDE"], ["No schema contains AC", "add (A, C)"]],
          note: "Result: four schemas, lossless and dependency preserving." },
        { k: "table", h: "The two algorithms side by side", src: src("§7.5"), size: 22, rowH: 0.78, colW: [4.6, 3.8, 3.73], rows: [
          ["", "BCNF decomposition", "3NF synthesis"], ["Starts from", "R and F", "a canonical cover Fc"],
          ["Lossless", "yes", "yes"], ["Dependency preserving", "not always", "yes"], ["Result", "BCNF", "3NF"]] },
        { k: "quick", h: "Quick check: session 36", src: "Questions written for IDB201 on DSC 7th ed., §7.5",
          qs: ["Is the result of the BCNF algorithm always lossless? Always dependency preserving?",
               "Why does 3NF synthesis sometimes add a schema with a candidate key?",
               "Why must 3NF synthesis start from a canonical cover?"],
          ans: "1 yes; no; 2 to make the decomposition lossless; 3 to avoid redundant or oversized schemas from extraneous attributes." },
      ] },
    { n: 37, name: "Beyond FDs", sum: "7.6 multivalued dependencies, 4NF; 7.8 1NF; CQ7.1–CQ7.3",
      slides: [
        { k: "table", h: "7.6 Redundancy that FDs cannot see", src: ex("§7.6"), size: 20, rowH: 0.6, colW: [1.8, 2.6, 3.0], w: 7.4, mono: true, rows: [
          ["ID", "child_name", "phone"], ["I3001", "Irene", "512-555-1234"], ["I3001", "Irene", "512-555-4321"], ["I3001", "Eve", "512-555-1234"], ["I3001", "Eve", "512-555-4321"]],
          right: { x: 8.3, w: 4.4, card: ["The problem", "Children and phones are independent, so every child is paired with every phone. No FD holds, yet the table is redundant."] } },
        { k: "cards", h: "7.6 Multivalued dependencies", src: src("§7.6.1"), cards: [
          ["MVD α →→ β", "For tuples that agree on α, the β-values and the other values are independent"],
          ["Example", "ID →→ child_name and ID →→ phone"],
          ["FDs are MVDs", "If α → β then α →→ β", HEX.paleOrange]] },
        { k: "draw", h: "7.6 Fourth normal form", src: ex("§7.6.2–7.6.3"), draw: (s) => {
          tree(s, "(ID, child_name, phone)", [["(ID, child_name)"], ["(ID, phone)"]], "4NF: for every nontrivial α →→ β, α is a superkey. Every 4NF schema is in BCNF.", { rx: 3.8, rw: 5.6, kw: 4.2, via: "ID →→ child_name" });
        } },
        { k: "bul", h: "7.8 Atomic domains and first normal form", src: src("§7.8"), items: [
          "A domain is atomic if its values are indivisible units",
          "R is in 1NF if all its domains are atomic",
          "Not atomic: a set of names in one value; a composite stored as one value",
          "The relational model of this course assumes 1NF"],
          right: { card: ["Atomic for whom?", "course_id CS-101 is atomic, unless programs extract the department CS from it."] } },
        { k: "cards", h: "Self-study: §7.7 and §7.9", src: "Self-study source: DSC 7th ed., §7.7, p. 341; §7.9, pp. 343–346", cards: [
          ["§7.7 More normal forms", "Project-join and domain-key normal forms; second normal form"],
          ["§7.9 The design process", "E-R modelling and normalization together"],
          ["Denormalization", "Keeping redundancy on purpose for performance, with its cost", HEX.paleOrange]] },
        { k: "cards", h: "Putting design together", src: src("§7.9; synthesis for IDB201"), cards: [
          ["E-R first", "A good E-R model usually gives schemas close to BCNF"],
          ["Then normalize", "FDs reveal what the diagram hid"],
          ["Then decide", "BCNF or 3NF, and any deliberate denormalization: milestone 1 asks you to justify this", HEX.paleOrange]] },
        { k: "cq", id: "CQ7.1", look: "Where to look: DSC 7th ed., §7.3, §7.6; self-study §7.7", prompts: [
          "What does a violating dependency say about repeated values?",
          "Compare the BCNF and 4NF conditions",
          "What role does “superkey” play in each?"] },
        { k: "cq", id: "CQ7.2", look: "Where to look: DSC 7th ed., §7.3.2–7.3.3", prompts: [
          "Use dept_advisor as the example",
          "What does an unpreserved FD cost on each update?",
          "What redundancy does 3NF keep?"] },
        { k: "cq", id: "CQ7.3", look: "Where to look: DSC 7th ed., §7.3, §7.5; Lucchesi and Osborn, JCSS 1978", prompts: [
          "How many candidate keys can a schema with n attributes have?",
          "Which normal-form test needs the candidate keys?",
          "Do real schemas reach the worst case? What do designers do instead?"] },
      ] },
    { n: 38, name: "Guided exercises", sum: "FD theory on paper: closures, keys, covers, BCNF and 3NF",
      slides: [
        { k: "plan", h: "Plan of session 38", src: "IDB201 syllabus, session 38", rows: [
          ["Exercise 1", "Closures and candidate keys", "10 min"],
          ["Exercise 2", "Canonical cover", "10 min"],
          ["Exercise 3", "BCNF decomposition and preservation", "13 min"],
          ["Exercise 4", "3NF synthesis", "10 min", true],
          ["Next", "Milestone 1 in session 39", "2 min"]] },
        { k: "bul", h: "Exercise 1: candidate keys", src: "Exercise written for IDB201; DSC 7th ed., §7.4", items: [
          "R(A, B, C, D, E), F = { A → BC, CD → E, B → D, E → A }",
          "Compute A⁺, E⁺, B⁺, (BC)⁺ and (CD)⁺",
          "List all candidate keys"],
          right: { card: ["Hint", "Every attribute appears on a right side, so start from single attributes."] } },
        { k: "table", h: "Exercise 1: solution", src: "Solution written for IDB201; DSC 7th ed., §7.4.2", size: 22, rowH: 0.7, colW: [2.4, 5.0, 4.73], rows: [
          ["Set", "Closure", "Key?"], ["A", "ABCDE", "candidate key"], ["E", "EABCD", "candidate key"], ["B", "BD", "no"],
          ["BC", "BCDEA", "candidate key"], ["CD", "CDEAB", "candidate key"]],
          note: "Keys: A, E, BC, CD. {A, B} is a superkey but not a candidate key." },
        { k: "bul", h: "Exercise 2: canonical cover", src: "Exercise written for IDB201; DSC 7th ed., §7.4.3", items: [
          "F = { A → BC, B → C, AB → D }",
          "Find the extraneous attributes, one at a time",
          "Give a canonical cover Fc"],
          right: { card: ["Hint", "Compute A⁺ under F first."] } },
        { k: "code", h: "Exercise 2: solution", src: "Solution written for IDB201; DSC 7th ed., §7.4.3", codeW: 8.4, code:
"A⁺ under F = ABCD\nB in AB → D: A⁺ ⊇ D        → extraneous\n             gives A → D\nC in A → BC: with A → B,\n  A⁺ = AB, B → C gives C   → extraneous\nunion A → B, A → D\n\nFc = { A → BD, B → C }",
          items: ["Check: Fc and F have the same closures"] },
        { k: "bul", h: "Exercise 3: BCNF", src: "Exercise written for IDB201; DSC 7th ed., §7.5.1", items: [
          "R(A, B, C, D, E), F = { A → B, BC → D, D → E }",
          "Find the candidate key",
          "Decompose R into BCNF",
          "Which FDs are preserved?"] },
        { k: "draw", h: "Exercise 3: solution", src: "Solution written for IDB201; algorithm of DSC 7th ed., §7.5.1", draw: (s) => {
          tree(s, "R(A, B, C, D, E), key AC", [["(A, B)"], ["(A, C, D, E)", ["(D, E)", "(A, C, D)"], "D → E violates"]], "Preserved: A → B, D → E. Lost: BC → D (B, C and D are in no common schema).", { rx: 3.9, rw: 5.4, kw: 3.4, via: "A → B violates" });
        } },
        { k: "table", h: "Exercise 4: 3NF synthesis of the same R", src: "Solution written for IDB201; DSC 7th ed., §7.5.2", size: 22, rowH: 0.72, colW: [5.4, 6.73], rows: [
          ["Step", "Result"], ["Fc", "{ A → B, BC → D, D → E } (already canonical)"], ["One schema per FD", "(A, B), (B, C, D), (D, E)"], ["Key AC in none of them", "add (A, C)"]],
          note: "Four 3NF schemas: lossless and dependency preserving. Compare with Exercise 3 (CQ7.2)." },
        { k: "cards", h: "Preparing milestone 1 (session 39)", src: "IDB201 Group Project brief, milestone 1", cards: [
          ["Bring", "E-R model, normalized schema with constraints, research question and related-work list"],
          ["Show", "The FDs of your domain and the normal form of each schema"],
          ["Justify", "Any 3NF or denormalized schema: what you gain and what it costs", HEX.paleOrange]] },
      ] },
  ],
  back: [
    { k: "list", h: "Practice exercises", src: "Exercises written for IDB201; more: Chapter 7 exercise sheet and DSC Practice Exercises 7.1–7.13, pp. 353–355", items: [
      "R(A, B, C, D), F = { A → B, B → C }. Compute A⁺, find the candidate key, and decide whether R is in BCNF.",
      "Decompose R into BCNF. Is the result dependency preserving?",
      "Is the decomposition (A, B, C), (C, D) of the same R lossless?"] },
    { k: "list", h: "Practice exercises: answers", src: "Answers written for IDB201 on DSC 7th ed., §7.3–7.5", fill: HEX.pale, items: [
      "A⁺ = ABC; D is on no right side and (AD)⁺ = ABCD: the key is AD. Not BCNF: A → B starts from a non-superkey.",
      "With B → C: (B, C), (A, B, D); then A → B: (A, B), (A, D). Result (B, C), (A, B), (A, D); both FDs preserved.",
      "No: C⁺ = C determines neither part; r = {(1, x, c, p), (2, y, c, q)} gives 4 tuples in the join."] },
    { k: "cards", h: "Summary", src: "DSC 7th ed., Ch. 7", cols: 3, num: false, cards: [
      ["Redundancy", "Update, insertion and deletion anomalies"],
      ["FDs", "Closure, axioms, attribute closure, keys"],
      ["Covers", "Extraneous attributes; canonical cover"],
      ["Decomposition", "Lossless test; dependency preservation"],
      ["Normal forms", "BCNF, 3NF; MVDs and 4NF; 1NF"],
      ["Algorithms", "BCNF decomposition; 3NF synthesis", HEX.paleOrange]] },
    { k: "cards", h: "Before the next session", src: "IDB201 syllabus, sessions 38–40", cards: [
      ["Within one week", "Choose one of CQ7.1–CQ7.3 and submit your answer on the LMS"],
      ["Session 39", "Milestone 1: design review of your project (graded, 25% of the project)", HEX.paleOrange],
      ["Session 40", "Read DSC Ch. 13, §13.1–13.3 and §13.5"]] },
  ],
};

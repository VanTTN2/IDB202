// Chapter 2 – The relational model and relational algebra (sessions 4, 5, 6, 8)
// Relational calculus is not part of the course (council review, 18 Nov 2026).
const L = require("../lib");
const { HEX, X0, CW } = L;
const src = (x) => `Source: DSC 7th ed., ${x}`;
const ex = (x) => `Example written for IDB201 on the University data (givenDB); DSC 7th ed., ${x}`;

module.exports = {
  n: 2,
  title: "The relational model and relational algebra",
  textbook: "DSC Ch. 2, §2.1–2.6, pp. 37–57; Chapter 2 exercises, pp. 60–62.",
  clos: ["CLO2", "CLO3"],
  objectives: [
    "Describe relations, tuples, attributes and domains; tell schema from instance",
    "Identify superkeys, candidate keys, primary keys and foreign keys",
    "Read and draw a schema diagram",
    "Write queries with σ, Π, ∪, −, ×, ρ, ⋈, ∩, ÷ and aggregation",
    "Check whether two simple expressions are equivalent, or find a counterexample",
  ],
  sessions: [
    { n: 4, name: "The relational model", sum: "2.1–2.4 structure, schema, keys, schema diagrams; relations as sets",
      slides: [
        { k: "bul", h: "2.1 Structure of relational databases", src: src("§2.1"), items: [
          "A relational database is a collection of tables, each with a unique name",
          "Relation = table, tuple = row, attribute = column",
          "The domain of an attribute is its set of permitted values; domains are atomic",
          "null means unknown or not existing; it causes difficulties (Chapter 3)"],
          right: { card: ["Relation instance", "The specific set of tuples a relation contains at a given moment."], fill: HEX.pale } },
        { k: "draw", h: "Reading a relation", src: ex("§2.1"), draw: (s) => {
          L.table(s, [["ID", "name", "dept_name", "salary"], ["I1001", "Nguyen", "Comp. Sci.", "92000"], ["I3001", "Curie", "Physics", "95000"], ["I4001", "Mendel", "Biology", "72000"]],
            1.2, 2.3, 7.0, { mono: true, size: 20, rowH: 0.62, colW: [1.5, 1.6, 2.3, 1.6] });
          L.text(s, "instructor", 1.2, 1.6, 3, 0.5, { bold: true, color: HEX.navy });
          L.arrow(s, 9.4, 2.6, 8.25, 2.6, { color: HEX.orange }); L.text(s, "attribute (column)", 9.5, 2.35, 3.3, 0.5, { fontSize: 20, color: HEX.orange, bold: true });
          L.arrow(s, 9.4, 3.55, 8.25, 3.55, { color: HEX.orange }); L.text(s, "tuple (row)", 9.5, 3.3, 3.3, 0.5, { fontSize: 20, color: HEX.orange, bold: true });
          L.arrow(s, 9.4, 4.5, 8.25, 4.5, { color: HEX.orange }); L.text(s, "the order of rows does not matter", 9.5, 4.25, 3.3, 0.9, { fontSize: 20, color: HEX.orange, bold: true });
          L.text(s, "Schema: instructor(ID, name, dept_name, salary)", 1.2, 5.3, 11.0, 0.6, { fontFace: L.CODE, fontSize: 20 });
        } },
        { k: "bul", h: "The relational model as mathematics", src: src("§2.1; the set view of relations"), items: [
          "Given domains D1, …, Dn, a relation r is a subset of D1 × D2 × … × Dn",
          "Because r is a set: no duplicate tuples and no order among tuples",
          "A tuple maps attribute names to values; attribute order has no meaning"],
          right: { card: ["Why it matters", "The set view makes relational algebra (sessions 5–6) and design theory (Chapter 7) possible. SQL tables are bags, not sets (Chapter 3)."] } },
        { k: "code", h: "Keys and constraints as logic", src: src("§2.3; constraints written as logical statements"), codeW: 7.2, code:
"Key K of r:\n for all t1, t2 in r:\n   t1[K] = t2[K]  =>  t1 = t2\n\nForeign key r[A] -> s[B]:\n for all t in r:\n   exists u in s:\n     t[A] = u[B]",
          items: ["A constraint is a statement every legal instance must satisfy", "The DBMS rejects any change that breaks it", "Chapter 7 adds functional dependencies"] },
        { k: "code", h: "2.2 The university schema", src: src("§2.2 and Appendix A; course database University"), codeW: 7.4, code:
"department(dept_name, building, budget)\ncourse(course_id, title, dept_name,\n       credits)\ninstructor(ID, name, dept_name, salary)\nsection(course_id, sec_id, semester,\n        year, building, room_number,\n        time_slot_id)\nteaches(ID, course_id, sec_id,\n        semester, year)\nstudent(ID, name, dept_name, tot_cred)\ntakes(ID, course_id, sec_id, semester,\n      year, grade)\nadvisor(s_ID, i_ID)\nprereq(course_id, prereq_id)",
          items: ["A relation schema lists attributes with their domains", "The schema rarely changes; the instance changes all the time"] },
        { k: "table", h: "2.3 Keys", src: src("§2.3"), size: 20, rowH: 1.0, colW: [2.6, 5.6, 3.93], rows: [
          ["Concept", "Definition", "University example"],
          ["Superkey", "A set of attributes whose values identify a tuple", "{ID}, {ID, name} on instructor"],
          ["Candidate key", "A minimal superkey", "{ID} on instructor"],
          ["Primary key", "The candidate key chosen by the designer", "(course_id, sec_id, semester, year) for section"]],
          note: "Every superkey contains a candidate key; adding attributes to a superkey keeps it a superkey." },
        { k: "table", h: "2.3 Foreign keys and referential integrity", src: src("§2.3"), size: 20, rowH: 1.15, colW: [3.0, 5.0, 4.13], rows: [
          ["Constraint", "Meaning", "University example"],
          ["Foreign key", "Values must appear as the primary key of the referenced relation", "instructor.dept_name references department"],
          ["Referential integrity", "Values must appear in some referenced tuple (not necessarily its key)", "section.time_slot_id appears in time_slot"]],
          note: "Inserting an instructor of a department that does not exist is rejected (Lab 2 shows the error)." },
        { k: "table", h: "Find the keys", src: "Exercise written for IDB201 on DSC 7th ed., §2.3", size: 22, rowH: 0.62, colW: [1.6, 1.6, 1.6], w: 4.8, mono: true, rows: [
          ["A", "B", "C"], ["1", "x", "p"], ["2", "x", "q"], ["3", "y", "p"]],
          right: { x: 6.0, w: 6.7, card: ["Questions", ["Which single attributes could be keys, judging from this instance?", "Can an instance prove that {A} is a key?", "Which set is certainly not a superkey?"]] },
          notes: "Answers: A could be a key; an instance can only refute a key, never prove it (keys are part of the schema); {B} and {C} are not superkeys because of repeated values." },
        { k: "draw", h: "2.4 Schema diagram of University", src: "Drawn for IDB201 from givenDB; notation of DSC 7th ed., §2.4", draw: (s) => {
          const tk = L.relBox(s, "takes", ["ID", "course_id", "sec_id", "semester", "year", "grade"], ["ID", "course_id", "sec_id", "semester", "year"], 0.5, 1.35, 2.2);
          const st = L.relBox(s, "student", ["ID", "name", "dept_name", "tot_cred"], ["ID"], 3.05, 1.35, 2.2);
          const ad = L.relBox(s, "advisor", ["s_ID", "i_ID"], ["s_ID"], 5.6, 1.35, 1.7);
          const ins = L.relBox(s, "instructor", ["ID", "name", "dept_name", "salary"], ["ID"], 7.65, 1.35, 2.2);
          const te = L.relBox(s, "teaches", ["ID", "course_id", "sec_id", "semester", "year"], ["ID", "course_id", "sec_id", "semester", "year"], 10.2, 1.35, 2.6);
          const se = L.relBox(s, "section", ["course_id", "sec_id", "semester", "year", "time_slot_id"], ["course_id", "sec_id", "semester", "year"], 0.5, 4.0, 2.6);
          const co = L.relBox(s, "course", ["course_id", "title", "dept_name", "credits"], ["course_id"], 3.6, 4.4, 2.4);
          const de = L.relBox(s, "department", ["dept_name", "building", "budget"], ["dept_name"], 6.5, 4.6, 2.6);
          const pr = L.relBox(s, "prereq", ["course_id", "prereq_id"], ["course_id", "prereq_id"], 9.6, 4.6, 2.2);
          L.arrow(s, 2.7, tk.row(0), 3.05, st.row(0), { color: HEX.orange });
          L.arrow(s, 7.3, ad.row(1), 7.65, ins.row(0), { color: HEX.orange });
          L.arrow(s, 10.2, te.row(0), 9.85, ins.row(0), { color: HEX.orange });
          L.arrow(s, 1.6, tk.y + tk.h, 1.6, se.y, { color: HEX.orange });
          L.arrow(s, 3.1, se.row(0), 3.6, co.row(0), { color: HEX.orange });
          L.arrow(s, 6.0, co.row(2), 6.5, de.row(0), { color: HEX.orange });
          L.arrow(s, 8.75, ins.y + ins.h, 8.0, de.y, { color: HEX.orange });
        } },
        { k: "cards", h: "2.4 How to read a schema diagram", src: src("§2.4"), cards: [
          ["Boxes", "One box per relation: its name on top, its attributes inside"],
          ["Underlined", "The attributes of the primary key"],
          ["Arrows", "From a foreign key to the primary key it references"],
          ["Two-headed arrows", "Referential constraints that are not foreign keys"]] },
      ] },
    { n: 5, name: "Relational algebra (1)", sum: "2.5 query languages; σ, Π, ∪, −, ×, ρ",
      slides: [
        { k: "cards", h: "2.5 Relational query languages", src: src("§2.5"), cards: [
          ["Imperative", "The user tells the system which sequence of operations to perform"],
          ["Functional", "Computation evaluates functions on data; relational algebra is functional"],
          ["Declarative", "The user describes the result without steps; SQL is mainly declarative"]],
          note: "Relational algebra is a “pure” language: small and formal, it shows the techniques behind SQL." },
        { k: "table", h: "The basic operators", src: src("§2.6"), size: 22, rowH: 0.72, colW: [3.0, 1.4, 7.73], rows: [
          ["Operation", "Symbol", "Result"],
          ["Select", "σ", "Tuples that satisfy a predicate"], ["Project", "Π", "Chosen attributes; duplicates removed"],
          ["Union", "∪", "Tuples in either input"], ["Set difference", "−", "Tuples in the first input but not the second"],
          ["Cartesian product", "×", "Every pair of tuples"], ["Rename", "ρ", "A new name for a relation"]] },
        { k: "code", h: "Select", src: ex("§2.6.1"), codeW: 7.0, code:
"σ dept_name = \"Physics\" (instructor)\n\nσ dept_name = \"Physics\"\n  ∧ salary > 90000 (instructor)\n\n-- result of the second query:\n-- (I3001, Curie, Physics, 95000)",
          items: ["Predicates use =, ≠, <, ≤, >, ≥", "Combine with ∧ (and), ∨ (or), ¬ (not)", "The result is a relation with the same schema"] },
        { k: "code", h: "Project and composition", src: ex("§2.6.2–2.6.3"), codeW: 7.0, code:
"Π ID, name, salary (instructor)\n\n-- names of physics instructors\nΠ name (σ dept_name = \"Physics\"\n          (instructor))\n\n-- result: {(Curie), (Bohr)}",
          items: ["Projection removes duplicates: the result is a set", "Every result is a relation, so operations compose"] },
        { k: "code", h: "Union and set difference", src: ex("§2.6.4–2.6.5"), codeW: 7.6, code:
"Π course_id (σ semester = \"Fall\"\n   ∧ year = 2025 (section))\n  ∪\nΠ course_id (σ semester = \"Spring\"\n   ∧ year = 2026 (section))\n\n-- with − instead of ∪:\n-- {BI-101, MA-101, MA-210, PH-101}",
          items: ["∪: courses taught in either term (10 courses on University)", "−: taught in Fall 2025 but not in Spring 2026"] },
        { k: "cards", h: "When are union and difference allowed?", src: src("§2.6.4"), cards: [
          ["Same arity", "Both inputs have the same number of attributes"],
          ["Compatible domains", "The i-th attributes of both inputs have compatible types"],
          ["Example", "Π ID(instructor) ∪ Π ID(student) is allowed; instructor ∪ student is not (different schemas)", HEX.paleOrange]] },
        { k: "draw", h: "Cartesian product", src: "Example written for IDB201 on DSC 7th ed., §2.6.6", draw: (s) => {
          L.table(s, [["A"], ["1"], ["2"]], 0.8, 1.8, 1.4, { mono: true, size: 22, rowH: 0.6 });
          L.text(s, "×", 2.4, 2.3, 0.8, 0.8, { fontSize: 40, bold: true, color: HEX.orange, align: "center" });
          L.table(s, [["B"], ["x"], ["y"], ["z"]], 3.3, 1.8, 1.4, { mono: true, size: 22, rowH: 0.6 });
          L.text(s, "=", 4.9, 2.3, 0.8, 0.8, { fontSize: 40, bold: true, color: HEX.orange, align: "center" });
          L.table(s, [["A", "B"], ["1", "x"], ["1", "y"], ["1", "z"], ["2", "x"], ["2", "y"], ["2", "z"]], 5.9, 1.45, 2.6, { mono: true, size: 20, rowH: 0.55 });
          L.autoCard(s, 9.0, 1.45, 3.7, 4.0, "Size", "If r has n1 tuples and s has n2, then r × s has n1 · n2 tuples: here 2 · 3 = 6.", "cartesian", { fill: HEX.paleOrange });
        } },
        { k: "code", h: "Rename", src: src("§2.6.8"), codeW: 7.0, code:
"-- salaries smaller than some\n-- other salary\nΠ instructor.salary\n (σ instructor.salary < d.salary\n   (instructor × ρ d (instructor)))",
          items: ["ρ x (E) returns E under the name x", "Needed to use one relation twice", "On University: every salary except the highest, 95000"] },
        { k: "quick", h: "Quick check: session 5", src: "Questions written for IDB201 on DSC 7th ed., §2.6",
          qs: ["r has 4 tuples and s has 5. How many tuples does r × s have?",
               "Can you compute Π ID(instructor) − Π ID(teaches)? What does it return on University?",
               "Why is instructor ∪ department not allowed?"],
          ans: "1 twenty; 2 yes, the instructors who teach nothing: I8000 (Vu); 3 different arity and attributes." },
      ] },
    { n: 6, name: "Relational algebra (2)", sum: "⋈, ∩, ←; equivalent queries; division and aggregation",
      slides: [
        { k: "code", h: "The join operation", src: ex("§2.6.7"), codeW: 7.2, code:
"r ⋈θ s  =  σθ (r × s)\n\n-- physics instructors and courses\nΠ name, course_id\n (σ dept_name = \"Physics\"\n  (instructor ⋈ instructor.ID\n     = teaches.ID teaches))\n\n-- result: (Curie, PH-101),\n--         (Bohr, PH-201)",
          items: ["A join is a Cartesian product followed by a selection", "θ is a predicate over the attributes of r and s", "Writing ⋈ lets a system evaluate it efficiently (Chapter 9)"] },
        { k: "draw", h: "A join as an expression tree", src: "Diagram drawn for IDB201 after DSC 7th ed., §2.6.7", draw: (s) => {
          L.node(s, "Π name, course_id", 1.4, 1.5, 3.6, 0.8);
          L.node(s, "σ instructor.ID = teaches.ID", 1.0, 2.9, 4.4, 0.8);
          L.node(s, "×", 2.6, 4.2, 1.2, 0.8, { shape: "ellipse" });
          L.node(s, "instructor", 0.8, 5.5, 2.4, 0.8, { fill: HEX.pale }); L.node(s, "teaches", 3.3, 5.5, 2.4, 0.8, { fill: HEX.pale });
          L.arrow(s, 3.2, 2.9, 3.2, 2.3); L.arrow(s, 3.2, 4.2, 3.2, 3.7); L.arrow(s, 2.0, 5.5, 2.8, 4.9); L.arrow(s, 4.5, 5.5, 3.6, 4.9);
          L.text(s, "=", 6.0, 3.3, 0.8, 0.8, { fontSize: 40, bold: true, color: HEX.orange, align: "center" });
          L.node(s, "Π name, course_id", 7.6, 2.0, 3.6, 0.8);
          L.node(s, "⋈ instructor.ID = teaches.ID", 7.2, 3.5, 4.4, 0.8, { fill: HEX.paleOrange });
          L.node(s, "instructor", 7.0, 5.0, 2.4, 0.8, { fill: HEX.pale }); L.node(s, "teaches", 9.5, 5.0, 2.4, 0.8, { fill: HEX.pale });
          L.arrow(s, 9.4, 3.5, 9.4, 2.8); L.arrow(s, 8.2, 5.0, 9.0, 4.3); L.arrow(s, 10.7, 5.0, 9.8, 4.3);
        } },
        { k: "cards", h: "Intersection and assignment", src: src("§2.6.4, §2.6.9"), cards: [
          ["Intersection ∩", ["r ∩ s: tuples in both inputs", "Inputs must be compatible", "Not basic: r ∩ s = r − (r − s)"]],
          ["Assignment ←", ["temp ← E names an intermediate result", "Breaks a long expression into steps", "Adds no expressive power"]]] },
        { k: "code", h: "Equivalent queries", src: src("§2.6.10"), codeW: 7.4, code:
"-- A\nσ dept_name = \"Physics\"\n  ∧ salary > 90000 (instructor)\n-- B\nσ dept_name = \"Physics\"\n  (σ salary > 90000 (instructor))\n-- C\nσ dept_name = \"Physics\" (instructor ⋈ teaches)\n-- D\n(σ dept_name = \"Physics\" (instructor)) ⋈ teaches",
          items: ["Equivalent: same result on every instance", "A ≡ B: cascade of selections", "C ≡ D: push the selection below the join", "Optimizers use such rules (Chapter 9)"] },
        { k: "cards", h: "Disproving an equivalence", src: "Example written for IDB201 on DSC 7th ed., §2.6.10", cards: [
          ["Claim", "Π A (r ∩ s) = Π A (r) ∩ Π A (s) for every r(A, B), s(A, B)?"],
          ["Counterexample", "r = {(1, x)}, s = {(1, y)}: left side ∅, right side {(1)}"],
          ["Lesson", "One instance is enough to refute a claim; to prove it, reason about all instances", HEX.paleOrange]] },
        { k: "draw", h: "Division: “for all” queries", src: "Example written for IDB201 on DSC 7th ed., division as an extended operator", draw: (s) => {
          L.text(s, "takes(ID, course_id)", 0.8, 1.45, 3.6, 0.5, { fontSize: 20, bold: true, color: HEX.navy });
          L.table(s, [["ID", "course_id"], ["S1", "BI-101"], ["S1", "BI-230"], ["S2", "BI-101"], ["S3", "BI-230"], ["S3", "BI-101"]], 0.8, 2.0, 3.6, { mono: true, size: 20, rowH: 0.55 });
          L.text(s, "÷", 4.7, 3.1, 0.8, 0.8, { fontSize: 40, bold: true, color: HEX.orange, align: "center" });
          L.text(s, "biology courses", 5.6, 1.45, 3.0, 0.5, { fontSize: 20, bold: true, color: HEX.navy });
          L.table(s, [["course_id"], ["BI-101"], ["BI-230"]], 5.6, 2.0, 2.2, { mono: true, size: 20, rowH: 0.55 });
          L.text(s, "=", 8.0, 3.1, 0.8, 0.8, { fontSize: 40, bold: true, color: HEX.orange, align: "center" });
          L.table(s, [["ID"], ["S1"], ["S3"]], 9.0, 2.0, 1.6, { mono: true, size: 20, rowH: 0.55 });
          L.autoCard(s, 0.8, 5.5, 11.9, 1.1, null, "r ÷ s keeps each t such that t combined with every tuple of s is in r. S2 misses BI-230.", "division", { fill: HEX.paleOrange });
        } },
        { k: "code", h: "Division on University", src: ex("division; definition from the basic operators"), codeW: 7.6, code:
"Π ID, course_id (takes)\n  ÷\nΠ course_id (σ dept_name = \"Biology\"\n              (course))\n\n-- result: (S0009) = Minh\n\n-- from basic operators, S ⊆ R:\nr ÷ s = Π R−S (r) −\n  Π R−S ((Π R−S (r) × s) − r)",
          items: ["Biology offers BI-101 and BI-230", "Only Minh has taken both", "Division adds no expressive power"] },
        { k: "code", h: "Aggregation", src: ex("aggregation as an extended operator"), codeW: 6.6, code:
"-- average salary per department\nG[dept_name][avg(salary)]\n  (instructor)\n\n-- written in DSC as\n-- dept_name 𝒢 avg(salary) (instructor)",
          right: null, card: ["Result on University", "Biology 72000 (Dang's null salary is ignored), Comp. Sci. 70000, Economics 69000, Mathematics 74500, Physics 89000"] },
        { k: "cards", h: "Self-study before session 8", src: "IDB201 syllabus, sessions 6–8; Chapter 2 exercise sheet", cards: [
          ["Part A (RelaX)", "Write queries A1–A7 on the University data and check the results"],
          ["Part B (paper)", "Five short exercises: join, difference, keys, division"],
          ["Textbook", "Re-read §2.6; try Practice Exercises 2.1–2.8 (DSC pp. 60–61)", HEX.paleOrange]] },
      ] },
    { n: 8, name: "Guided exercises", sum: "Relational algebra in RelaX; equivalent expressions; CQ2.1–CQ2.3",
      slides: [
        { k: "plan", h: "Plan of session 8", src: "IDB201 syllabus, session 8", rows: [
          ["RelaX", "Check part A of the exercise sheet together", "10 min"],
          ["Exercises 1–3", "Difference, join, equivalence", "15 min"],
          ["CQ2.1–CQ2.3", "Discussion in groups, then whole class", "18 min", true],
          ["Next", "Lab 1 in sessions 13–14", "2 min"]] },
        { k: "cards", h: "Using RelaX with the University data", src: "RelaX relational algebra calculator (online); exercise sheet, part A", cards: [
          ["Load", "Open the IDB201 dataset given on the LMS"],
          ["Write", "Type the expression with the operator buttons"],
          ["Check", "Compare the result with your hand-computed answer"]],
          note: "RelaX is optional: every exercise can also be done on paper." },
        { k: "bul", h: "Exercise 1: who teaches nothing?", src: "Exercise written for IDB201 on DSC 7th ed., §2.6", items: [
          "Write an expression for the IDs and names of instructors who teach no course",
          "Hint: start from the IDs of all instructors and of those who teach",
          "Run it in RelaX on the University data"],
          bottom: "Bonus: why must the difference be taken on IDs before the join with instructor?" },
        { k: "code", h: "Exercise 1: solution", src: ex("§2.6"), codeW: 7.6, code:
"nt ← Π ID (instructor) − Π ID (teaches)\nΠ ID, name (nt ⋈ instructor)\n\n-- result: (I8000, Vu)",
          card: ["Why IDs first?", "instructor and teaches have different schemas, so the difference must be taken on compatible projections."] },
        { k: "bul", h: "Exercise 2: courses of physics instructors", src: "Exercise written for IDB201 on DSC 7th ed., §2.6", items: [
          "Write two different expressions for the course_ids taught by instructors of the Physics department",
          "Show that both give the same result on University",
          "Which one would you expect to be cheaper? Why?"] ,
          right: { card: ["Hint", "Select before or after the join."] } },
        { k: "code", h: "Exercise 2: solution", src: ex("§2.6.10"), codeW: 8.2, code:
"-- E1: select after the join\nΠ course_id (σ dept_name = \"Physics\"\n  (instructor ⋈ teaches))\n-- E2: select first\nΠ course_id ((σ dept_name = \"Physics\"\n  (instructor)) ⋈ teaches)\n\n-- both: {PH-101, PH-201}",
          items: ["E2 joins only 2 instructors instead of 12", "Pushing selections down is rule 7a of Chapter 9"] },
        { k: "cards", h: "Exercise 3: equivalent or not?", src: "Exercise written for IDB201 on DSC 7th ed., §2.6.10", cols: 3, cards: [
          ["(a)", "σ θ1 (σ θ2 (r)) = σ θ1 ∧ θ2 (r)"],
          ["(b)", "Π A (Π A, B (r)) = Π A (r)"],
          ["(c)", "Π A (r − s) = Π A (r) − Π A (s)"]],
          note: "Answers: (a) yes; (b) yes; (c) no: r = {(1, x)}, s = {(1, y)} gives {(1)} on the left and ∅ on the right." },
        { k: "cq", id: "CQ2.1", look: "Where to look: DSC 7th ed., §2.1, §2.6", prompts: [
          "What would a key mean if a relation could contain the same tuple twice?",
          "What does projection return when duplicates are kept?",
          "Compare with SQL tables, which are bags (Chapter 3)"] },
        { k: "cq", id: "CQ2.2", look: "Where to look: DSC 7th ed., §2.6 (division); §3.8.3 (not exists)", prompts: [
          "Write “students who took all Biology courses” with ÷ and with basic operators",
          "Why is a separate ‘for all’ operator not needed?",
          "How would you write it in SQL? (preview of Chapter 3)"] },
        { k: "cq", id: "CQ2.3", look: "Where to look: DSC 7th ed., §2.6; §5.4 (recursive queries)", prompts: [
          "Write expressions for the prerequisites of a course at depth 1, 2, 3, …",
          "Why can no single expression cover every depth?",
          "How does SQL solve this? (Chapter 4, recursive queries)"] },
      ] },
  ],
  back: [
    { k: "list", h: "Practice exercises", src: "Exercises written for IDB201; more: DSC Practice Exercises 2.1–2.8, pp. 60–61", items: [
      "Give the primary key of takes(ID, course_id, sec_id, semester, year, grade). Why is grade not part of it?",
      "Write in relational algebra and check in RelaX: the names of the students who took CS-101.",
      "Write with ∩ and check in RelaX: the names of the students who took both CS-101 and CS-315."] },
    { k: "list", h: "Practice exercises: answers", src: "Answers written for IDB201 on DSC 7th ed., §2.3, §2.6 and the University data", fill: HEX.pale, items: [
      "{ID, course_id, sec_id, semester, year}: one enrollment per section. grade describes the enrollment; it does not identify it.",
      "Π name (σ course_id = \"CS-101\" (takes) ⋈ student): An, Bao, Binh, Chau, Giang, Minh, Quang, Thao, Viet.",
      "Π name ((Π ID σ course_id = \"CS-101\" (takes) ∩ Π ID σ course_id = \"CS-315\" (takes)) ⋈ student): An, Binh, Quang, Viet."] },
    { k: "cards", h: "Summary", src: "DSC 7th ed., Ch. 2", cols: 3, num: false, cards: [
      ["Relations", "Sets of tuples over atomic domains; schema ≠ instance"],
      ["Keys", "Superkey, candidate, primary and foreign keys"],
      ["Diagrams", "Boxes, underlined keys, arrows for foreign keys"],
      ["Basic algebra", "σ, Π, ∪, −, ×, ρ"],
      ["Derived", "⋈, ∩, ← add convenience, not power"],
      ["Extended", "Division (“for all”) and aggregation", HEX.paleOrange]] },
    { k: "cards", h: "Before the next session", src: "IDB201 syllabus, sessions 8–9", cards: [
      ["Within one week", "Choose one of CQ2.1–CQ2.3 and submit your answer on the LMS"],
      ["Project", "Teams and domains were approved in session 7: start the requirements", HEX.paleOrange],
      ["Session 9", "Read DSC Ch. 3, §3.1–3.3, pp. 65–78"]] },
  ],
};

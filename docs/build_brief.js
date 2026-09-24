const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType,
  WidthType, ShadingType, LevelFormat, BorderStyle, Footer, PageNumber, TableOfContents, PageBreak,
} = require("docx");

const OUT = process.argv[2];
const FONT = "Arial";
const ACCENT = "1F4E79";      // headings, header rows
const HILITE = "FFF2CC";      // academic emphasis highlight (light amber)
const SOFT = "DEEAF6";        // light blue for header rows
const W = 9026;               // A4 text width with 1" margins (11906 - 2*1440)

const border = { style: BorderStyle.SINGLE, size: 4, color: "A6A6A6" };
const borders = { top: border, bottom: border, left: border, right: border };

// ---- text helpers -------------------------------------------------------
// Inline markup: **bold**, ==highlighted academic emphasis==
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|==[^=]+==)/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith("**")) out.push(new TextRun({ text: t.slice(2, -2), bold: true, ...base }));
    else out.push(new TextRun({ text: t.slice(2, -2), bold: true, shading: { type: ShadingType.CLEAR, fill: "FFE699", color: "auto" }, ...base }));
    last = m.index + t.length;
  }
  if (last < text.length) out.push(new TextRun({ text: text.slice(last), ...base }));
  return out;
}
const P = (text, opts = {}) => new Paragraph({ children: runs(text), spacing: { after: 120 }, ...opts });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const B = (text, level = 0) => new Paragraph({ numbering: { reference: "bullets", level }, children: runs(text), spacing: { after: 60 } });
const N = (text) => new Paragraph({ numbering: { reference: "numbers", level: 0 }, children: runs(text), spacing: { after: 60 } });

function cell(text, width, { header = false, fill, bold = false } = {}) {
  const lines = Array.isArray(text) ? text : [text];
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: fill || header ? { fill: header ? ACCENT : fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: lines.map((l) => new Paragraph({
      spacing: { after: 40 },
      children: header ? [new TextRun({ text: l, bold: true, color: "FFFFFF", size: 18 })]
                       : runs(l, { size: 18, ...(bold ? { bold: true } : {}) }),
    })),
  });
}

// rows: array of arrays; widths must sum to W. highlightCol: column index shaded as academic emphasis
function table(headers, rows, widths, { highlightCol = -1, highlightRows = [] } = {}) {
  const sum = widths.reduce((a, b) => a + b, 0);
  if (sum !== W) throw new Error(`widths sum ${sum} != ${W}`);
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, widths[i], { header: true })) }),
      ...rows.map((r, ri) => new TableRow({
        children: r.map((c, i) => cell(c, widths[i], {
          fill: i === highlightCol || highlightRows.includes(ri) ? HILITE : undefined,
        })),
      })),
    ],
  });
}
const gap = () => new Paragraph({ spacing: { after: 120 }, children: [] });

// ---- content ------------------------------------------------------------
const children = [];

// Title block
children.push(
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1800, after: 240 },
    children: [new TextRun({ text: "IDB202 – Introduction to Databases", bold: true, size: 40, color: ACCENT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 480 },
    children: [new TextRun({ text: "Academic Emphasis Brief for the Syllabus Review Council", size: 30, color: "404040" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: "Bachelor of Computer Science – AI and Data Science (BCS_AD), cohort K22A", size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: "Talented-student (honors) classes – Year 1, Semester 1 – 3 credits", size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 960 },
    children: [new TextRun({ text: "Companion document to IDB202_Syllabus.xlsx", size: 22, italics: true })] }),
  new Paragraph({ alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "How to read this brief: ", bold: true, size: 20 }),
               new TextRun({ text: "text marked like ", size: 20 }),
               new TextRun({ text: "this", bold: true, shading: { type: ShadingType.CLEAR, fill: "FFE699", color: "auto" }, size: 20 }),
               new TextRun({ text: ", and table cells shaded in amber, mark the academic and research elements that go beyond a standard, application-oriented database course.", size: 20 })] }),
  new Paragraph({ children: [new PageBreak()] }),
  new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new PageBreak()] }),
);

// 1. Executive summary
children.push(
  H1("1. Executive summary"),
  P("This brief supports the review of the proposed IDB202 syllabus. The course is delivered to **talented first-year Computer Science students in their first semester**. Following the direction from the program leadership, it is designed with an **academic and research orientation** rather than an applied, tool-centred one."),
  P("The proposal keeps every topic in the official course description (Appendix 2(d) of the K22A curriculum) and the university syllabus template: 3 credits, 45 contact hours in 60 sessions, 1 hour of final exam and 104 hours of self-study. What changes is the **depth and the way of learning**:"),
  B("==Formal foundations==: the relational model is treated as mathematics (sets, relations, first-order logic), linking directly to MAD102 Discrete Mathematics, which students take in the same semester."),
  B("==Proofs and algorithms==: students prove core results (Armstrong's axioms, the lossless-join test, correctness of two-phase locking) and implement the algorithms in Python, linking to PFP191."),
  B("==System internals==: storage, indexing, query optimization and transaction theory analyzed with cost models, as the official description requires."),
  B("==Research practice==: every chapter has a Research Corner built around a seminal paper, labs include an Investigate part (hypothesis → experiment → evidence), and the course ends with a mini research project written as a short paper."),
  B("==Assessment aligned with the orientation==: 40% of the grade rewards research work, and the final exam includes at least 30% analysis-level items."),
  gap(),
  table(
    ["Item", "Proposal"],
    [
      ["Course", "IDB202 – Introduction to Databases (listed as IDB201 in the K22A curriculum; see §10)"],
      ["Learners", "Talented-student (honors) classes; Year 1, Semester 1; no prerequisite"],
      ["Workload", "3 credits: 45h contact (60 sessions) + 1h final exam + 104h self-study"],
      ["Textbooks", "Silberschatz, Korth & Sudarshan, Database System Concepts, 7th ed. (2020); Ramakrishnan & Gehrke, Database Management Systems, 3rd ed. (2003)"],
      ["Primary literature", "==At least one seminal paper per chapter== (Codd 1970, 1972; Chen 1976; Selinger et al. 1979; Berenson et al. 1995; Kraska et al. 2018; Stonebraker & Pavlo 2024; …)"],
      ["CLOs", "9 CLOs; ==6 of 9 at the Analyze level or above== (Bloom)"],
      ["Assessment", "Labs 10% · Progress tests 20% · Assignment 1 10% · Assignment 2 (research project) 20% · Practical exam 10% · Final exam 30%"],
    ],
    [2300, 6726],
  ),
);

// 2. Positioning
children.push(
  H1("2. What is core for Computer Science students"),
  P("A database course serves a different purpose in each major. The proposal positions IDB202 as a **Computer Science** course: it answers *why* the relational approach works and *how* a DBMS works inside, rather than only *how to use* a database."),
  table(
    ["Major", "Main question the course answers", "Typical emphasis"],
    [
      ["Information Systems / Business", "How do I use a database to support an organization?", "Requirements, ER modeling, reporting SQL, BI tools"],
      ["Software Engineering", "How do I build applications on a DBMS?", "SQL, stored procedures, triggers, ORM, migrations"],
      ["Information Assurance", "How do I protect data?", "Access control, auditing, SQL injection, encryption"],
      ["==Computer Science (IDB202)==", "==Why does the relational approach work, and how does a DBMS work inside?==", "==Formal foundations, algorithms, complexity, correctness, system internals=="],
    ],
    [2300, 3363, 3363],
    { highlightRows: [3] },
  ),
  gap(),
  H2("2.1 Core content for CS (taught in depth)"),
  table(
    ["#", "Topic", "Why it is core for CS", "Chapter"],
    [
      ["C1", "Relational model as mathematics", "Built on set theory and logic (MAD102); the basis of declarative querying", "3"],
      ["C2", "Formal query languages: algebra, calculus, Codd's theorem, expressive power", "Query languages are a CS topic in their own right: syntax, semantics, expressiveness", "4"],
      ["C3", "Semantics of SQL: bags, three-valued logic, translation to algebra", "Explains why queries return what they return", "6"],
      ["C4", "Dependency theory: axioms, closure, keys, covers, normal forms, the chase", "A complete axiomatic theory with algorithms and proofs", "8"],
      ["C5", "Storage and indexing under an I/O cost model", "Data structures analyzed in external memory (links to ICS102, CSD203)", "9"],
      ["C6", "Query processing and optimization", "Search over a plan space guided by a cost model; active research area", "9"],
      ["C7", "Transaction theory: serializability, 2PL, recoverability, isolation", "Concurrency and correctness with proofs", "10"],
    ],
    [600, 3000, 4526, 900],
    { highlightCol: 1 },
  ),
  gap(),
  H2("2.2 Content de-emphasized (application-oriented)"),
  B("Stored procedures, functions and triggers: moved to an **optional appendix**, not assessed."),
  B("DBMS administration (backups, logins, jobs): mentioned briefly only."),
  B("GUI tools and front-end or ORM development: kept to what the labs need, or left to SE-track courses."),
);

// 3. Chapter highlights
const ch = [
  ["1. Introduction to database systems", "1–3", "Data independence and the three-schema architecture as design principles; history of data models", "Stonebraker & Pavlo (2024)", "CLO1"],
  ["2. The Entity–Relationship model", "4–8", "Design alternatives with justification; ==limits of ER== (constraints it cannot express)", "Chen (1976)", "CLO2"],
  ["3. Relational model and mapping", "9–13", "==Relations as sets; constraints as first-order logic; inclusion dependencies==; proof that every relation has a key; Sperner bound on the number of keys", "Codd (1970)", "CLO3"],
  ["4. Relational algebra", "14–19", "==Relational calculus (TRC/DRC), safety, Codd's theorem; limits of expressive power (transitive closure)==; Python algebra evaluator", "Codd (1972)", "CLO4"],
  ["5. SQL: data definition", "20–24", "Declarative vs. procedural integrity; ==why assertions are hard to check (incremental maintenance)==", "DSC §4.4", "CLO5"],
  ["6. SQL: queries", "25–33", "==Formal semantics of SQL: bag semantics, three-valued logic, translation to algebra==; proofs of NULL anomalies", "Chamberlin & Boyce (1974); Guagliardo & Libkin (2017)", "CLO5"],
  ["7. Data modification and views", "34–38", "View expansion; ==the view-update problem==; SQL injection explained by the separation of code and data", "Bancilhon & Spyratos (1981)", "CLO5"],
  ["8. Functional dependencies and normalization", "39–46", "==Proofs: soundness and completeness of Armstrong's axioms, correctness of closure, lossless-join test; complexity (primality is NP-complete); MVDs and 4NF==; Python FD toolkit", "Kent (1983); Armstrong (1974)", "CLO6"],
  ["9. Storage, indexing and query processing", "47–51", "==I/O cost model and cost formulas; B+-tree height analysis; System R dynamic programming for join order; cardinality estimation; learned indexes==; controlled experiments", "Selinger et al. (1979); Leis et al. (2015); Kraska et al. (2018)", "CLO7"],
  ["10. Transactions and concurrency", "52–56", "==Conflict and view serializability (NP-completeness); proof that 2PL is correct; recoverability; snapshot isolation and write skew==; Python serializability tester", "Eswaran et al. (1976); Berenson et al. (1995)", "CLO8"],
];
children.push(
  new Paragraph({ children: [new PageBreak()] }),
  H1("3. Chapter-by-chapter academic highlights"),
  P("The table lists, for each chapter, the sessions in the 60-session schedule, the **academic emphasis** added beyond a standard course (amber column), the Research Corner reading, and the main CLO. Sessions 57–59 are for Assignment 2 research presentations and session 60 is the course review."),
  table(["Chapter", "Sessions", "Academic emphasis", "Research Corner", "CLO"], ch, [2050, 800, 3776, 1700, 700], { highlightCol: 2 }),
  gap(),
  H2("3.1 The Research Corner"),
  P("Every chapter ends with a Research Corner: one seminal paper, read with **guiding questions** and discussed in class. The purpose is not to master every detail, but to build the habit of going back to primary sources and asking why a technique was invented."),
  H2("3.2 Links to other courses in the program"),
  table(
    ["Course", "Semester", "Connection used in IDB202"],
    [
      ["MAD102 Discrete Mathematics", "S1 (same)", "Sets, relations, logic and proof techniques → Ch. 3, 4, 8"],
      ["PFP191 Programming Fundamentals with Python", "S1 (same)", "Python implementations of algebra, FD algorithms and serializability tests"],
      ["ICS102 Introduction to Computer Systems", "S1 (same)", "Memory hierarchy → I/O cost model (Ch. 9)"],
      ["CSD203 Data Structures and Algorithms", "S2", "Trees and hashing, previewed by B+-trees and hash indexes"],
      ["DSI201, DAM311", "S3–S4", "SQL and data management for data science and mining; FD discovery for data profiling"],
      ["DPY391 Data Security and Privacy", "S5", "Access control, SQL injection"],
      ["AIL303m Machine Learning", "S3", "Learned indexes and learned query optimization (Ch. 9)"],
    ],
    [3400, 1200, 4426],
  ),
);

// 4. CLOs
children.push(
  new Paragraph({ children: [new PageBreak()] }),
  H1("4. Course learning outcomes"),
  P("Nine CLOs are proposed. Six of them are at the **Analyze level or above**, and CLO9 is a dedicated research outcome. Shaded rows are the outcomes that express the academic orientation most directly."),
  table(
    ["CLO", "Description", "Bloom level"],
    [
      ["CLO1", "Explain the fundamental concepts of database systems and trace how they arose from the research literature.", "Understand"],
      ["CLO2", "Design ER models, compare design alternatives, and identify constraints the ER model cannot express.", "Create"],
      ["CLO3", "Map ER models to relational schemas and state keys, foreign keys and other constraints precisely, including as logical statements.", "Apply"],
      ["CLO4", "Express queries in relational algebra and relational calculus, prove simple equivalences, and reason about expressive power.", "Analyze"],
      ["CLO5", "Write SQL to define, modify and query databases and explain its semantics (bags, three-valued logic) by translation to algebra.", "Apply"],
      ["CLO6", "Apply functional dependency theory: closures, keys, minimal covers, proofs, 3NF/BCNF, lossless-join and dependency preservation; implement the algorithms in Python.", "Analyze"],
      ["CLO7", "Analyze storage, indexing, query processing and optimization with I/O cost models, and evaluate index and plan choices experimentally.", "Evaluate"],
      ["CLO8", "Analyze schedules for serializability and recoverability, explain locking, isolation and recovery, and justify the correctness of 2PL.", "Analyze"],
      ["CLO9", "Conduct a small research study: read primary literature, formulate a question, design a reproducible experiment or implementation, and report it academically.", "Create"],
    ],
    [900, 6726, 1400],
    { highlightRows: [3, 5, 6, 7, 8] },
  ),
);

// 5. Assessment
children.push(
  H1("5. Proposed assessment structure"),
  P("The weights follow the component types of the university template (labs, progress tests, assignments, practical exam, final exam) and keep the completion criteria unchanged. The balance is shifted from the applied practical exam towards research work."),
  table(
    ["Component", "Standard template", "Proposal", "Format", "CLOs"],
    [
      ["Research labs (8)", "–", "==10%==", "Lab exercises, Python implementations with tests, Investigate mini-reports", "CLO2–CLO8"],
      ["Progress test 1", "10%", "10%", "30': 20 MCQ + 2 written reasoning items (ch. 1–4)", "CLO1–CLO4"],
      ["Progress test 2", "10%", "10%", "30': 20 MCQ + 2 written reasoning items (ch. 5–8)", "CLO5–CLO6"],
      ["Assignment 1", "10%", "10%", "Individual technical report (4–6 pages) + oral defense", "CLO2–CLO4, CLO9"],
      ["Assignment 2", "10%", "==20%==", "Group mini research project: short paper (IEEE), reproducible code, presentation", "CLO6–CLO9"],
      ["Practical exam", "30%", "==10%==", "60' SQL on computer (ch. 5–7)", "CLO5"],
      ["Final exam", "30%", "30%", "60', 50 MCQ; ==≥ 30% analysis-level items==", "CLO1–CLO8"],
      ["Total", "100%", "100%", "", ""],
    ],
    [1700, 1200, 1100, 3726, 1300],
  ),
  gap(),
  P("**Completion criteria (unchanged):** every on-going component > 0; practical exam > 0; final exam ≥ 4; final result ≥ 5."),
  H2("5.1 Rationale"),
  B("**40% research work** (labs 10%, Assignment 1 10%, Assignment 2 20%) rewards the habits the orientation targets: reading literature, proving, implementing and experimenting."),
  B("**60% individual mastery** (progress tests 20%, practical exam 10%, final exam 30%) keeps the individual guarantee of competence that the university requires."),
  B("The practical exam is reduced from 30% to 10% but **not removed**: later courses (DSI201, DAM311) need SQL fluency, and the labs already practise it every week."),
  B("Written reasoning items in the progress tests and analysis-level final-exam items ensure that the theory is assessed, not only recalled."),
);

// 6. Research activities
children.push(
  new Paragraph({ children: [new PageBreak()] }),
  H1("6. Research-oriented learning activities"),
  H2("6.1 Labs with an Investigate part"),
  P("Each of the 8 labs ends with an **Investigate** part in which students form a hypothesis, run an experiment and report the evidence. The Investigate part counts for at least 40% of each lab mark. Examples:"),
  table(
    ["Lab", "Investigate task (example)"],
    [
      ["Lab 3 – Relational algebra", "Implement a mini relational-algebra evaluator in Python; test algebraic equivalences on generated data"],
      ["Lab 5 – SQL queries", "Compare join, subquery and set-operation formulations of the same query: same result? same plan?"],
      ["Lab 7 – Normalization", "Implement closure, candidate keys, minimal cover, BCNF decomposition and the chase test; measure how the number of keys grows with the number of attributes"],
      ["Lab 8 – Indexing and transactions", "Measure logical reads with and without indexes on a 500,000-row table; reproduce dirty reads, phantoms and deadlocks; implement a precedence-graph serializability tester"],
    ],
    [2600, 6426],
  ),
  gap(),
  H2("6.2 Assignment 1 – Design and theory technical report (individual)"),
  B("An ER model with justified design alternatives and a formal relational schema, with constraints written as logic."),
  B("Queries in algebra, calculus and SQL, each with an argument for its correctness."),
  B("One guided experiment (the design is given; the student runs it and interprets the results)."),
  B("A 4–6 page report followed by a 5-minute oral defense."),
  H2("6.3 Assignment 2 – Mini research project (groups of 2–3)"),
  P("Students choose one of three research types and write a **short paper in IEEE format**, with reproducible code and a 15-minute presentation:"),
  N("**Empirical study**, e.g. \"When does a non-clustered index stop paying off as selectivity grows?\" or \"How much does the isolation level cost in throughput?\""),
  N("**Algorithm implementation and evaluation**, e.g. FD discovery on real datasets, or comparing BCNF decomposition strategies."),
  N("**Reproduction** of a result from a Research Corner paper at small scale, e.g. a simple learned index versus a B+-tree."),
  P("Grading: paper 50% (question, method, results, discussion, related work), reproducibility 20%, presentation and Q&A 20%, peer evaluation 10%."),
  H2("6.4 Constructivist questions"),
  P("The syllabus lists **33 constructivist questions**, three for each of 11 key sessions. They are open *why* and *what if* questions, for example:"),
  B("\"What would break if relations were allowed to contain duplicate tuples?\""),
  B("\"Testing whether an attribute is prime is NP-complete. What does this mean for automatic schema design tools?\""),
  B("\"Snapshot isolation prevents dirty reads, non-repeatable reads and phantoms. Why is it still not serializable?\""),
);

// 7. Alignment with official description
children.push(
  H1("7. Alignment with the official course description"),
  P("Every topic in the official IDB201/IDB202 description (Appendix 2(d)) is covered, so the academic orientation adds depth without dropping required content."),
  table(
    ["Official topic (Appendix 2(d))", "Chapter(s)", "Sessions"],
    [
      ["Entity-Relationship (ER) model", "2", "4–8"],
      ["Relational data model", "3", "9–13"],
      ["Relational algebra", "4", "14–18"],
      ["SQL", "5, 6, 7", "20–37"],
      ["Functional dependencies and normalization", "8", "39–45"],
      ["Indexing", "9", "47–51"],
      ["Query optimization", "9", "49–51"],
      ["Transaction management", "10", "52–56"],
      ["Outcome: design normalized schemas", "2, 3, 8 (CLO2, CLO3, CLO6)", "—"],
      ["Outcome: query databases proficiently using SQL", "5–7 (CLO5)", "—"],
      ["Outcome: understand internal mechanisms of storage and transaction control", "9, 10 (CLO7, CLO8)", "—"],
    ],
    [5026, 2500, 1500],
  ),
);

// 8. Feasibility
children.push(
  new Paragraph({ children: [new PageBreak()] }),
  H1("8. Feasibility for first-semester students"),
  P("The learners are talented but are in their **first semester**. The design keeps the course demanding without making it inaccessible:"),
  table(
    ["Risk", "Mitigation"],
    [
      ["Students have not yet learned formal proof", "MAD102 teaches proof techniques in the same semester; each proof is introduced with a worked example before students write their own."],
      ["Students are still learning Python", "Python tasks use only core features (lists, sets, dictionaries, functions) covered early in PFP191; starter code and unit tests are provided."],
      ["Research papers are difficult", "Papers are read with guiding questions and discussed in class; only selected sections are required."],
      ["Research workload", "Assignment 1 gives the experimental design; only Assignment 2 asks students to design their own study. Every task has a minimum version and an extension for the strongest students."],
      ["SQL fluency for later courses", "SQL is practised in 5 labs and still assessed by the practical exam and Progress test 2."],
    ],
    [2800, 6226],
  ),
);

// 9. Anticipated questions
children.push(
  H1("9. Anticipated questions from the council"),
  ...[
    ["Is this too theoretical for Year 1, Semester 1?",
     "The theory is chosen where it connects to what students learn at the same time (MAD102, PFP191, ICS102), and it is scaffolded. The target group is a talented cohort, and the leadership has asked for an academic orientation."],
    ["Why reduce the practical exam from 30% to 10%?",
     "Practical SQL skill is still trained in 5 labs and assessed in labs, Progress test 2 and the practical exam. The freed weight rewards research work, which is the explicit goal of the honors track."],
    ["Why are stored procedures and triggers optional?",
     "They are not in the official course description and are application-oriented. They remain available as an appendix for the project."],
    ["How is research work graded fairly?",
     "With published rubrics; Assignment 2 combines the paper, reproducibility, presentation and peer evaluation, and individual marks can differ based on contribution logs."],
    ["Are the readings accessible?",
     "The two textbooks are standard; the papers are classic, short and widely available through ACM and the university library."],
  ].flatMap(([q, a]) => [
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "Q: " + q, bold: true, color: ACCENT })] }),
    P("A: " + a),
  ]),
);

// 10. Open items
children.push(
  H1("10. Items requiring a decision"),
  N("**Course code:** the K22A curriculum lists **IDB201**; the proposal uses **IDB202**. The council should confirm the final code."),
  N("**CLO–PLO mapping:** the BCS_AD PLO list is needed to complete the mapping matrix in the syllabus template."),
  N("**Decision number and approval date** of the syllabus."),
  N("**Assessment weights:** approval of the proposed shift (practical exam 30% → 10%; research labs 10%; Assignment 2 20%) under the campus Course Implementation Plan."),
  N("**Next step:** once the syllabus is approved, the detailed lecture materials, labs and assignment briefs will be developed to match it."),
);

// ---- document -------------------------------------------------------------
const doc = new Document({
  creator: "IDB202 course team",
  title: "IDB202 – Academic Emphasis Brief",
  styles: {
    default: { document: { run: { font: FONT, size: 21 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: FONT, color: ACCENT },
        paragraph: { spacing: { before: 300, after: 160 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: FONT, color: "2E75B6" },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  features: { updateFields: true },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "IDB202 – Academic Emphasis Brief · Page ", size: 16, color: "808080" }),
                 new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "808080" })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log("Saved " + OUT); });

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
    children: [new TextRun({ text: "IDB201 – Introduction to Databases", bold: true, size: 40, color: ACCENT })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 480 },
    children: [new TextRun({ text: "Academic Emphasis Brief for the Syllabus Review Council", size: 30, color: "404040" })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: "Bachelor of Computer Science – AI and Data Science (BCS_AD), cohort K22A", size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [new TextRun({ text: "Talented-student (honors) classes – Year 1, Semester 1 – 3 credits", size: 22 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 960 },
    children: [new TextRun({ text: "Companion document to IDB201_Syllabus.xlsx – DRAFT for council review, not the issued version", size: 22, italics: true })] }),
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
  P("This brief supports the review of the proposed IDB201 syllabus. The course is delivered to **talented first-year Computer Science students in their first semester**. Following the direction from the program leadership, it is designed with an **academic and research orientation** rather than an applied, tool-centred one."),
  P("The proposal keeps every topic in the official course description (Appendix 2(d) of the K22A curriculum) and the university syllabus template: 3 credits, 45 contact hours in 60 sessions, 1 hour of final exam and 104 hours of self-study. What changes is the **depth and the way of learning**:"),
  B("==Formal foundations==: the relational model is treated as mathematics (sets, relations, first-order logic), linking directly to MAD102 Discrete Mathematics, which students take in the same semester."),
  B("==Proofs and algorithms==: students prove core results (Armstrong's axioms, the lossless-join test), explain why two-phase locking guarantees serializability, and trace the algorithms step by step on paper; Python implementations are optional self-study for students who take PFP191."),
  B("==System internals==: storage, indexing, query optimization and transaction theory analyzed with cost models, as the official description requires; the depth is set for first-semester students, who have not yet taken Data Structures and Algorithms."),
  B("==Programming the database server==: one chapter (6 sessions) on T-SQL user-defined functions, stored procedures, triggers and cursors, studied with a research angle (declarative constraints versus triggers; row-by-row versus set-based processing)."),
  B("==Research practice==: for every chapter that extends the knowledge base (all except the T-SQL skills chapter), students answer one constructivist (why / what-if) question in writing, labs include an Investigate part (hypothesis → experiment → evidence), and one group project runs through the whole course: teams design a database and answer research questions about it in an academic report."),
  B("==Assessment aligned with the orientation==: 40% of the grade rewards research work, the final exam carries 50%, and it includes at least 30% analysis-level items."),
  gap(),
  table(
    ["Item", "Proposal"],
    [
      ["Course", "IDB201 – Introduction to Databases (as listed in the K22A curriculum, Appendix 2(a))"],
      ["Learners", "Talented-student (honors) classes; Year 1, Semester 1; no prerequisite"],
      ["Workload", "3 credits: 45h contact (60 sessions) + 1h final exam + 104h self-study"],
      ["Textbooks", "Silberschatz, Korth & Sudarshan, Database System Concepts, 7th ed. (2020); Ramakrishnan & Gehrke, Database Management Systems, 3rd ed. (2003)"],
      ["Constructivist questions", "==27 questions (3 per chapter, 9 chapters; none for the T-SQL skills chapter C5)==; each student answers one per chapter in a short written answer, graded as part of the labs and CQ score"],
      ["CLOs", "8 CLOs (one per row of the template); ==6 of 8 at the Analyze level or above== (Bloom); CLO8 is a dedicated research outcome"],
      ["PLO contribution", "PLO2, PLO5, PLO7, PLO8, PLO9, PLO10, PLO11 (7 of the 13 BCS_AD PLOs; ==PLO5 research and critical thinking is supported by 5 CLOs==)"],
      ["Assessment", "5 labs and CQ answers 10% · Progress tests 5% + 5% · Assignment (group project) 30% · Final exam 50% · no practical exam"],
    ],
    [2300, 6726],
  ),
);

// 2. Positioning
children.push(
  H1("2. What is core for Computer Science students"),
  P("A database course serves a different purpose in each major. The proposal positions IDB201 as a **Computer Science** course: it answers *why* the relational approach works and *how* a DBMS works inside, rather than only *how to use* a database."),
  table(
    ["Major", "Main question the course answers", "Typical emphasis"],
    [
      ["Information Systems / Business", "How do I use a database to support an organization?", "Requirements, ER modeling, reporting SQL, BI tools"],
      ["Software Engineering", "How do I build applications on a DBMS?", "SQL, stored procedures, triggers, ORM, migrations"],
      ["Information Assurance", "How do I protect data?", "Access control, auditing, SQL injection, encryption"],
      ["==Computer Science (IDB201)==", "==Why does the relational approach work, and how does a DBMS work inside?==", "==Formal foundations, algorithms, complexity, correctness, system internals=="],
    ],
    [2300, 3363, 3363],
    { highlightRows: [3] },
  ),
  gap(),
  H2("2.1 Core content for CS (taught in depth)"),
  table(
    ["#", "Topic", "Why it is core for CS", "Chapter"],
    [
      ["C1", "Relational model as mathematics", "Built on set theory and logic (MAD102); the basis of declarative querying", "C2"],
      ["C2", "Formal query languages: algebra, calculus, Codd's theorem, expressive power", "Query languages are a CS topic in their own right: syntax, semantics, expressiveness", "C2, C4"],
      ["C3", "Semantics of SQL: three-valued logic, translation to algebra (bag semantics as guided self-study)", "Explains why queries return what they return", "C3"],
      ["C4", "Dependency theory: axioms, closure, keys, covers, normal forms, the chase", "A complete axiomatic theory with algorithms and proofs", "C7"],
      ["C5", "Storage and indexing under an I/O cost model", "Data structures analyzed in external memory (links to ICS102, CSD203)", "C8"],
      ["C6", "Query processing and optimization", "Search over a plan space guided by a cost model; active research area", "C9"],
      ["C7", "Transaction theory: serializability, 2PL, recoverability, isolation", "Concurrency and correctness", "C10"],
    ],
    [600, 3000, 4526, 900],
    { highlightCol: 1 },
  ),
  gap(),
  H2("2.2 Programming the database server (T-SQL)"),
  P("User-defined functions, stored procedures, triggers and cursors (DSC §5.2–5.3 and the T-SQL reference) form chapter C5 (sessions 20–25, including Lab 3). They give students the server-side programming skills that later courses and internships expect, and they are taught with a CS angle: when a trigger is needed because a constraint cannot express a rule, whether a set of triggers terminates, and why set-based SQL usually beats a cursor. Time for C5 comes from trimming the system-internals chapters (C8–C10) to the depth suitable for students who have not yet taken CSD203."),
  H2("2.3 Content de-emphasized (application-oriented)"),
  B("DBMS administration (backups, logins, jobs): mentioned briefly only."),
  B("GUI tools and front-end or ORM development: kept to what the labs need, or left to SE-track courses."),
  B("Programming in Python (database access, implementations of the algorithms): **optional self-study**, not taught in class and not required in the labs."),
);

// 3. Chapter highlights
const ch = [
  ["C1 Introduction (DSC 1)", "1–3", "Data independence and the three-schema architecture as design principles; history of data models", "Session 3", "CLO1"],
  ["C2 Relational model and relational algebra (DSC 2; online Ch. 27 self-study)", "4–8", "==Relations as sets; keys and constraints as logic; relational algebra with proofs; relational calculus and Codd's theorem (guided self-study)==; algebra exercises checked with RelaX", "Session 8", "CLO2, CLO3"],
  ["C3 Introduction to SQL (DSC 3)", "9–14", "==Formal semantics of SQL: three-valued logic, translation to algebra; bag semantics as guided self-study==; equivalent formulations of one query", "Session 12", "CLO3, CLO4"],
  ["C4 Intermediate and advanced SQL (DSC 4, §5.1, §5.4)", "15–19", "Declarative integrity; ==recursive queries and the limits of relational algebra (transitive closure)==; SQL injection explained by separating code and data", "Session 18", "CLO2, CLO3, CLO4"],
  ["C5 Programming the database server in T-SQL (DSC §5.2–5.3; T-SQL reference)", "20–25", "Functions, stored procedures, triggers and cursors; ==declarative constraints versus triggers; termination of cascading triggers; row-by-row versus set-based processing measured in the lab==", "— (skills chapter; no CQs)", "CLO2, CLO4"],
  ["C6 Database design with the E-R model (DSC 6)", "27–31", "Design alternatives with justification; ==limits of the E-R model== (constraints it cannot express)", "Session 30", "CLO2"],
  ["C7 Relational database design (DSC 7)", "32–38", "==Functional-dependency theory with proofs (Armstrong's axioms, closure, canonical cover, lossless join); decomposition algorithms; MVDs and 4NF==; FD exercises on paper", "Session 37", "CLO5"],
  ["C8 Storage and indexing (DSC 12–14)", "41–44", "==I/O cost model; B+-tree height analysis; cost of index lookups versus scans; learned indexes==; B+-tree deletion and multiple-key access as self-study", "Session 44", "CLO6"],
  ["C9 Query processing and optimization (DSC 15–16)", "45–48", "==Cost of sorting and join algorithms; equivalence rules==; reading execution plans; dynamic programming for join order as optional self-study", "Session 47", "CLO6"],
  ["C10 Transactions, concurrency control and recovery (DSC 17–19)", "49–54", "==Conflict serializability and precedence graphs; two-phase locking and the lock point; recoverability==; snapshot isolation as an overview; recovery in one overview session, the rest guided self-study", "Session 54", "CLO7"],
];

children.push(
  new Paragraph({ children: [new PageBreak()] }),
  H1("3. Chapter-by-chapter academic highlights"),
  P("The table lists, for each chapter, the sessions in the 60-session schedule, the **academic emphasis** added beyond a standard course (amber column), the session in which the chapter's constructivist questions are discussed, and the main CLO. The course follows the chapter order of *Database System Concepts* (7th ed.), and every session in the syllabus cites the exact sections and pages. Session 7 introduces the group project, session 39 is its design review, sessions 55–57 are its progress meeting and final presentations, and sessions 58–60 are for review and final-exam practice."),
  table(["Chapter", "Sessions", "Academic emphasis", "CQ discussion", "CLO"], ch, [2050, 800, 3776, 1700, 700], { highlightCol: 2 }),
  gap(),
  H2("3.1 Constructivist questions as research practice"),
  P("Each chapter has three open *why* and *what if* questions, discussed in class in one session. After the discussion, each student chooses **one** question and submits a short written answer within a week. The answers count for 4% of the grade. The task is deliberately short, so it builds the habit of questioning and justifying without overloading first-semester students."),
  H2("3.2 In class versus guided self-study"),
  P("Sections that are **abstract and hard to explore through experiments** are assigned as guided self-study. Students read them with a worksheet or exercises, and they are assessed in the progress tests and the final exam (about 20% of the final-exam items). Class time goes to topics that benefit from discussion, proof and experiment."),
  table(
    ["Chapter", "Guided self-study (DSC)", "Why"],
    [
      ["C2", "Online Ch. 27: tuple and domain relational calculus", "Purely formal; learned best by working through a worksheet, reviewed in session 8"],
      ["C3", "Bag (multiset) semantics of SQL: duplicates, ALL vs. DISTINCT, algebraic laws that fail for bags (Ch. 3, with a worksheet)", "Formal and best learned by working through examples; class time goes to three-valued logic and translation to algebra"],
      ["C4", "§4.7 Authorization; §5.5 Advanced aggregation; §9.8 Application security", "Descriptive or syntax-oriented"],
      ["C5", "T-SQL reference: dynamic SQL with sp_executesql", "Extends the SQL-injection discussion of C4 to code inside procedures"],
      ["C6–C7", "§6.8, §6.10–6.11; §7.7, §7.9", "Extensions and notations; more normal forms"],
      ["C8–C9", "§12.1, §12.6, §13.4, §14.4, §14.6; §15.6–15.7; §16.3; §16.4 (optional)", "Hardware background (with ICS102); statistics estimation is abstract and hard to observe directly; join ordering by dynamic programming needs CSD203"],
      ["C10", "§18.3, §18.5, §18.7, §18.9; Ch. 19 except the overview (§19.2, §19.4–19.6)", "Alternative protocols, compared with 2PL taught in class; recovery algorithms are abstract and cannot be reproduced safely in a student lab"],
      ["C4, C7", "Python: accessing SQL Server with pyodbc and pandas; Python versions of the FD algorithms (optional)", "Programming is not the focus of the course; students who take PFP191 can practise it on their own"],
    ],
    [1100, 4026, 3900],
  ),
  gap(),
  H2("3.3 Links to other courses in the program"),
  table(
    ["Course", "Semester", "Connection used in IDB201"],
    [
      ["MAD102 Discrete Mathematics", "S1 (same)", "Sets, relations, logic and proof techniques → C2, C7"],
      ["PFP191 Programming Fundamentals with Python", "S1 (same)", "Optional self-study: Python access to SQL Server and Python versions of the FD algorithms"],
      ["ICS102 Introduction to Computer Systems", "S1 (same)", "Memory hierarchy → I/O cost model (C8)"],
      ["CSD203 Data Structures and Algorithms", "S2", "Trees and hashing, previewed by B+-trees and hash indexes"],
      ["DSI201, DAM311", "S3–S4", "SQL and data management for data science and mining; FD discovery for data profiling"],
      ["DPY391 Data Security and Privacy", "S5", "Access control, SQL injection"],
      ["AIL303m Machine Learning", "S3", "Learned indexes and learned query optimization (C8, C9)"],
    ],
    [3400, 1200, 4426],
  ),
);

// 4. CLOs
const Y = "✓";
children.push(
  new Paragraph({ children: [new PageBreak()] }),
  H1("4. Course learning outcomes (CLOs)"),
  P("Eight CLOs are proposed, one for each CLO row of the university template. They were derived from four sources: the **official course description** (Appendix 2(d)), the **two textbooks**, the **courses of the 9-semester BCS_AD program that build on IDB201**, and the **academic orientation** of the honors classes. Six of the eight are at the **Analyze level or above**, and CLO8 is a dedicated research outcome."),
  H2("4.1 CLO statements"),
  table(
    ["CLO", "Description", "Bloom level", "Chapters"],
    [
      ["CLO1", "Explain the fundamental concepts of database systems (data models, schemas and instances, the three-schema architecture, data independence, DBMS components) and relate them to the research contributions that introduced them.", "Understand", "C1"],
      ["CLO2", "Design a database from requirements: build an Entity-Relationship model, justify design alternatives, and map it to a relational schema whose keys and integrity constraints are specified precisely, including as logical statements.", "Create", "C2, C4, C5, C6"],
      ["CLO3", "Formulate queries in relational algebra and relational calculus, prove simple equivalences between expressions, and explain the limits of their expressive power.", "Analyze", "C2, C3, C4"],
      ["CLO4", "Use SQL to define, populate, modify and query relational databases (joins, aggregation, subqueries, views, parameterized queries), program the database server in T-SQL (user-defined functions, stored procedures, triggers, cursors), and explain query results through SQL semantics (three-valued logic; bag semantics through guided self-study).", "Apply", "C3, C4, C5"],
      ["CLO5", "Analyze and improve relational schemas with functional dependency theory: compute closures, candidate keys and minimal covers, prove basic properties, decompose to 3NF/BCNF with lossless-join and dependency-preservation guarantees.", "Analyze", "C7"],
      ["CLO6", "Evaluate physical design and query execution choices (storage organization, indexes, join algorithms, execution plans) using I/O cost models and controlled experiments.", "Evaluate", "C8, C9"],
      ["CLO7", "Analyze concurrent executions for conflict serializability and recoverability, and justify concurrency-control and recovery mechanisms (two-phase locking, isolation levels, write-ahead logging).", "Analyze", "C10"],
      ["CLO8", "Conduct a small, reproducible research study on a database topic: review primary literature, formulate a research question or hypothesis, design and carry out an experiment or implementation, and report the results in an academic report and presentation.", "Create", "Constructivist questions; group project"],
    ],
    [800, 5626, 1200, 1400],
    { highlightRows: [1, 2, 4, 5, 6, 7] },
  ),
  gap(),
  H2("4.2 How the CLOs were derived"),
  N("**Official course description.** Its three outcome statements are covered directly: \"design normalized database schemas\" → CLO2 and CLO5; \"query databases proficiently using SQL\" → CLO4; \"understand the internal mechanisms of storage and transaction control\" → CLO6 and CLO7."),
  N("**Textbooks.** The CLOs follow the main knowledge units shared by Silberschatz et al. (2020) and Ramakrishnan & Gehrke (2003): foundations, design, formal query languages, SQL, dependency theory, storage and query processing, and transactions."),
  N("**The 9-semester program.** Each CLO prepares for named later courses (§4.4). IDB201 is the entry point of the program skill set \"Data Handling, Databases and Data Mining\"."),
  N("**Academic orientation.** ==Formal reasoning (CLO3), proofs and algorithms (CLO5), experimental evaluation (CLO6), correctness arguments (CLO7) and a full research cycle (CLO8)== raise the level above a standard, application-oriented course."),
  N("**Writing rules.** Each CLO starts with one measurable action verb at the stated Bloom level, names observable evidence, and is assessed by at least two graded components (§4.6)."),
  H2("4.3 Bloom's taxonomy distribution"),
  table(
    ["Bloom level", "CLOs", "Count"],
    [
      ["Remember", "–", "0"],
      ["Understand", "CLO1", "1"],
      ["Apply", "CLO4", "1"],
      ["==Analyze==", "CLO3, CLO5, CLO7", "3"],
      ["==Evaluate==", "CLO6", "1"],
      ["==Create==", "CLO2, CLO8", "2"],
      ["**Analyze or above**", "", "**6 of 8 (75%)**"],
    ],
    [2600, 4626, 1800],
    { highlightRows: [3, 4, 5] },
  ),
  gap(),
  H2("4.4 Alignment with the 9-semester program"),
  P("The table shows the later BCS_AD courses each CLO prepares for (semester in brackets; combo courses marked *) and the program skill set it contributes to (Appendix 2(e))."),
  table(
    ["CLO", "Prepares for (course, semester)", "Program skill set"],
    [
      ["CLO1", "DSI201 Data Science (S3); MLO401 Machine Learning Operations (S8); BDI302c Big Data* (S8)", "Data Handling, Databases and Data Mining"],
      ["CLO2", "DAM321 Data Mining Project (S5); OJT202 On-the-Job Training (S6); EXE101/EXE201 Experiential Entrepreneurship (S7–S8); ADP490 Capstone Project (S9)", "Data Handling, Databases and Data Mining; Data Engineering, Security, Privacy and AI Governance"],
      ["CLO3", "Reinforces MAD102 Discrete Mathematics (S1, same semester); CSD203 Data Structures and Algorithms (S2); BDI302c Big Data* (S8), where Spark and Hive operators are relational-algebra operators", "Programming, Algorithms and Data Structures"],
      ["CLO4", "DSI201 Data Science (S3); DAM311 Data Mining (S4); DVI301 Data Visualization* (S5); OJT202 (S6); AMA401 Advanced Methods for Data Analysis (S7); MLO401 (S8)", "Data Handling, Databases and Data Mining"],
      ["CLO5", "DSI201 data cleaning (S3); DAM311 pattern discovery (S4); DPY391 Data Security and Privacy (S5): data minimization and privacy by design", "Data Handling, Databases and Data Mining; Data Engineering, Security, Privacy and AI Governance"],
      ["CLO6", "CSD203 trees, hashing and algorithm analysis (S2); MLD301 Machine Learning with Large Datasets* (S7): memory and disk trade-offs; BDI302c Big Data* (S8)", "Programming, Algorithms and Data Structures; Data Handling, Databases and Data Mining"],
      ["CLO7", "DPY391 Data Security and Privacy (S5): integrity and availability; OJT202 (S6); MLO401 (S8): reliable data pipelines", "Data Engineering, Security, Privacy and AI Governance"],
      ["CLO8", "ENW493c Research Methods and Academic Writing (S5); DAM321 Data Mining Project (S5); AMA401 analytical reports (S7); ADP490 Capstone Project or EXE402 (S9)", "Soft skills: Academic, Scientific Thinking, Critical Thinking, Communication"],
    ],
    [800, 5226, 3000],
  ),
  gap(),
  H2("4.5 Coverage in the schedule"),
  table(
    ["CLO", "Chapters", "Sessions (of 60)"],
    [
      ["CLO1", "C1", "1–3; constructivist-question answer after session 3; Progress test 1 in 26; review in 58"],
      ["CLO2", "C2, C4, C5, C6", "4, 16, 19, 22, 25, 27–31; project design review in 39; Progress test 2 in 40; project presentations in 56–57"],
      ["CLO3", "C2, C3, C4", "4–8, 12, 14, 17; Progress test 1 in 26"],
      ["CLO4", "C3, C4, C5", "9–25 (Labs 1–3 in 13, 14, 19, 24, 25); Progress test 1 in 26; project presentations in 56–57"],
      ["CLO5", "C7", "32–38; project design review in 39; Progress test 2 in 40; project presentations in 56–57"],
      ["CLO6", "C8, C9", "41–48 (Lab 5 part 1 in 48); project in 55–57"],
      ["CLO7", "C10", "49–54 (Lab 5 part 2 in 53); project in 55–57"],
      ["CLO8", "Constructivist questions; group project", "9 discussion sessions (3, 8, 12, 18, 30, 37, 44, 47, 54); project in 7, 39, 55–57; Investigate part of every lab"],
    ],
    [800, 3700, 4526],
  ),
  gap(),
  H2("4.6 CLO – assessment matrix"),
  P("Every CLO is assessed by at least two components, and every component assesses at least one CLO."),
  table(
    ["CLO", "Labs & CQ 10%", "PT1 5%", "PT2 5%", "Assignment (group project) 30%", "FE 50%"],
    [
      ["CLO1", Y, Y, "", "", Y],
      ["CLO2", Y, Y, Y, Y, Y],
      ["CLO3", Y, Y, "", Y, Y],
      ["CLO4", Y, Y, "", Y, Y],
      ["CLO5", Y, "", Y, Y, Y],
      ["CLO6", Y, "", "", Y, Y],
      ["CLO7", Y, "", "", Y, Y],
      ["CLO8", Y, "", "", Y, ""],
    ],
    [1026, 1500, 1300, 1300, 2400, 1500],
  ),
  gap(),
  H2("4.7 CLO – PLO mapping (BCS_AD, 13 PLOs)"),
  P("The mapping uses the 13 PLOs of the BCS_AD program. The PLO summaries below are English renderings of the official Vietnamese wording, which remains the reference text."),
  table(
    ["PLO", "Summary"],
    [
      ["PLO1", "Social sciences, politics and law, security and defence, sustainable development; scientific worldview and methodology"],
      ["==PLO2==", "Foundations of science, mathematics, probability and statistics, and common development tools in CS, AI and DS"],
      ["PLO3", "Apply core AI and DS technologies (machine learning, deep learning, big data) to design, build and deploy intelligent systems"],
      ["PLO4", "Basic planning, organizing, executing and monitoring of professional work"],
      ["==PLO5==", "Innovation and entrepreneurship; start-up, research or application projects; creativity, research, analysis, critical thinking and problem solving"],
      ["PLO6", "English at level 4 (Vietnam's 6-level framework) and basic Japanese"],
      ["==PLO7==", "Communication and presentation of problems, analyses and solutions"],
      ["==PLO8==", "Proficient programming and effective use of tools, libraries and platforms"],
      ["==PLO9==", "Keep up with, exploit and apply advanced tools, techniques and technologies"],
      ["==PLO10==", "Independent work and teamwork; responsibility; self-learning and lifelong learning"],
      ["==PLO11==", "Professional conduct, ethics, social responsibility, and integrity in research and development"],
      ["PLO12", "Physical and mental strength, national identity, confidence in international settings"],
      ["PLO13", "Plan, coordinate and manage the resources of AI and DS projects"],
    ],
    [1100, 7926],
  ),
  gap(),
  P("**Mapping matrix** (✓ = the CLO contributes to the PLO; highlighted PLOs above are the ones IDB201 contributes to):"),
  table(
    ["CLO", "PLO2", "PLO5", "PLO7", "PLO8", "PLO9", "PLO10", "PLO11"],
    [
      ["CLO1", Y, "", "", "", "", "", ""],
      ["CLO2", Y, Y, "", "", "", "", ""],
      ["CLO3", Y, Y, "", "", "", "", ""],
      ["CLO4", Y, "", "", Y, "", "", ""],
      ["CLO5", Y, Y, "", Y, "", "", ""],
      ["CLO6", Y, Y, "", "", Y, "", ""],
      ["CLO7", Y, "", "", "", "", "", ""],
      ["CLO8", "", Y, Y, "", "", Y, Y],
      ["**CLOs**", "**7**", "**5**", "**1**", "**2**", "**1**", "**1**", "**1**"],
    ],
    [1426, 1100, 1100, 1050, 1050, 1050, 1100, 1150],
  ),
  gap(),
  P("PLO1, PLO3, PLO4, PLO6, PLO12 and PLO13 are not mapped. The columns for them are empty in the syllabus template."),
  H2("4.8 Rationale for each link"),
  table(
    ["Link", "Why", "Evidence"],
    [
      ["CLO1–CLO7 → PLO2", "IDB201 is a foundation course: it gives the data-management knowledge (relational model, SQL, normalization, storage, transactions) and the standard tool (SQL/DBMS) that later AI and DS courses build on.", "Progress tests, final exam"],
      ["CLO2, CLO3, CLO5, CLO6 → PLO5", "==The academic orientation==: students analyze requirements and justify designs (CLO2), prove equivalences (CLO3), prove and apply dependency theory (CLO5), and form hypotheses and test them experimentally (CLO6).", "Written reasoning items, project design review, Investigate parts of the labs"],
      ["CLO8 → PLO5", "A complete, small research project: literature, question, method, results.", "Group project report"],
      ["CLO4, CLO5 → PLO8", "Proficient use of SQL, T-SQL programming and a DBMS (CLO4); FD algorithms applied to normalize a real design (CLO5).", "Labs 1–3, Progress tests 1–2, project design review"],
      ["CLO6 → PLO9", "Students apply and evaluate modern techniques (indexing, cost-based optimization) and discuss current research directions such as learned indexes.", "Lab 5 (part 1), group project"],
      ["CLO8 → PLO7", "Research results are communicated as an academic report and a 15-minute presentation with Q&A.", "Project report, design review and final presentation"],
      ["CLO8 → PLO10", "Individual work (labs, constructivist-question answers) and team work with contribution logs and peer evaluation (group project); guided self-study of the textbook.", "Project peer evaluation, CQ answers"],
      ["CLO8 → PLO11", "Research integrity: reproducible code and data, correct citation, and mandatory disclosure of generative-AI use.", "Project reproducibility criterion (10%)"],
    ],
    [2000, 4826, 2200],
    { highlightCol: -1 },
  ),
  gap(),
  H2("4.9 PLOs not mapped, and why"),
  table(
    ["PLO", "Reason"],
    [
      ["PLO1", "Social sciences, politics and defence are covered by the political-theory and national-defence courses."],
      ["PLO3", "Applying ML, DL and big data to build intelligent systems is the goal of AIL303m (S3), DPL302m (S4), BDI302c (S8) and the capstone. IDB201 supports PLO3 only indirectly, by providing the data foundation these courses rely on, so it is not claimed."],
      ["PLO4, PLO13", "Planning and project management are developed in EXE101/EXE201, MMP301 and the capstone. IDB201 does not assess them."],
      ["PLO6", "Language proficiency is assessed in the English and Japanese courses. IDB201 is taught in English with an English textbook, which supports PLO6 indirectly without assessing it."],
      ["PLO12", "Physical education and cultural identity are covered by the PE and traditional-instrument courses."],
    ],
    [1500, 7526],
  ),
  P("Claiming only the PLOs that IDB201 actually assesses keeps the program-level CLO–PLO matrix credible for accreditation."),
);

// 5. Assessment
children.push(
  H1("5. Proposed assessment structure"),
  P("The weights follow the component types of the university template. The final exam carries ==50%==, and the on-going components (labs, progress tests, assignment) carry the other 50%. There is ==no practical exam==: SQL skills are assessed in the labs, the progress tests and the group project."),
  table(
    ["Component", "Standard template", "Proposal", "Format", "CLOs"],
    [
      ["Labs and constructivist questions", "–", "==10%==", "5 labs (6%): SQL and T-SQL exercises and Investigate mini-reports; 9 short CQ answers (4%)", "CLO1–CLO8"],
      ["Progress test 1", "10%", "==5%==", "30': 20 MCQ + 2 written reasoning items (Chapters 1–5)", "CLO1–CLO4"],
      ["Progress test 2", "10%", "==5%==", "30': 20 MCQ + 2 written reasoning items (Chapters 6–7)", "CLO2, CLO5"],
      ["Assignment (group project)", "20%", "==30%==", "One project for the whole course (teams of 3–4): design review, academic report, reproducible SQL scripts, presentation", "CLO2–CLO8"],
      ["Practical exam", "30%", "==removed==", "–", "–"],
      ["Final exam", "30%", "==50%==", "60', 50 MCQ; ==≥ 30% analysis-level items==", "CLO1–CLO7"],
      ["Total", "100%", "100%", "", ""],
    ],
    [1700, 1200, 1100, 3726, 1300],
  ),
  gap(),
  P("**Completion criteria:** every on-going component > 0; final exam ≥ 5; final result ≥ 5."),
  H2("5.1 Rationale"),
  B("**50% final exam** gives a strong individual guarantee of competence, and the analysis-level items ensure that the theory is assessed, not only recalled."),
  B("**40% research work** (labs and constructivist questions 10%, group project 30%) rewards the habits the orientation targets: questioning, proving and experimenting."),
  B("**One group project instead of two assignments** lowers the workload and lets each team carry one database from design (E-R model, normalization) through T-SQL business rules to experiments (triggers versus constraints, indexes, plans, isolation levels)."),
  B("**No practical exam:** SQL is practised in Labs 1–2, T-SQL programming in Lab 3, and both are used in Labs 4–5 and in the project; they are assessed in Progress test 1."),
);

// 6. Research activities
children.push(
  new Paragraph({ children: [new PageBreak()] }),
  H1("6. Research-oriented learning activities"),
  H2("6.1 Labs with an Investigate part"),
  P("The course has **5 labs** (8 lab sessions), all in SQL Server. Relational algebra and FD theory are practised in guided exercise sessions on paper. Each lab ends with an **Investigate** part in which students form a hypothesis, run an experiment and report the evidence. The Investigate part counts for at least 40% of each lab mark."),
  table(
    ["Lab (sessions)", "Content and Investigate task (example)"],
    [
      ["Lab 1 – SQL queries (13–14)", "Single-table queries, joins, NULL behaviour, aggregation, subqueries; compare join, subquery and set-operation formulations of the same query: same result? same plan?"],
      ["Lab 2 – DDL, constraints, views (19)", "Declare keys, foreign keys and checks; test which violations each constraint catches; parameterized queries against SQL injection"],
      ["Lab 3 – T-SQL programming (24–25)", "Functions and stored procedures with error handling; triggers for business rules and audit logs; solve one task with a cursor and with set-based SQL and measure the difference as the data grows"],
      ["Lab 4 – E-R design (31)", "Model a case study, reduce it to relations and implement it in SQL Server; justify one design alternative"],
      ["Lab 5 – Indexing, query plans and concurrency (48, 53)", "Part 1: measure logical reads with and without indexes on a large table; find the selectivity at which an index stops paying off; compare join algorithms in execution plans. Part 2: reproduce dirty reads, phantoms and deadlocks with two sessions; draw the precedence graph of each observed schedule"],
    ],
    [2600, 6426],
  ),
  gap(),
  H2("6.2 Assignment – group project (teams of 3–4)"),
  P("One project runs through the whole course and replaces the two assignments of the earlier draft:"),
  N("**Session 7 – introduction:** teams choose an application domain; the brief explains how to state a research question and keep work reproducible."),
  N("**Session 39 – milestone 1, design review:** E-R model with justified alternatives, normalized relational schema with constraints, SQL queries with correctness arguments, T-SQL procedures and triggers for the business rules, and the team's research questions."),
  N("**Session 55 – milestone 2, progress meeting:** method and preliminary results, e.g. \"When does a non-clustered index stop paying off on our data?\", \"How much does a trigger slow down inserts compared with a CHECK constraint?\" or \"Which anomalies appear in our workload at each isolation level?\""),
  N("**Sessions 56–57 – final presentations:** academic report, reproducible SQL scripts and data, 15-minute presentation with Q&A."),
  P("Grading: design review 25%, final report 40%, reproducibility 10%, presentation and Q&A 20%, peer evaluation 5%."),
  H2("6.4 Constructivist questions"),
  P("The syllabus lists **27 constructivist questions**, three for each of 9 key sessions, one per chapter. The T-SQL chapter (C5) has none: it is a skills chapter, and the questions are kept for the chapters that extend the conceptual knowledge. They are open *why* and *what if* questions. Students answer one per chapter (§3.1). Examples:"),
  B("\"What would break if relations were allowed to contain duplicate tuples?\""),
  B("\"Testing whether an attribute is prime is NP-complete. What does this mean for automatic schema design tools?\""),
  B("\"Why does two-phase locking guarantee serializability? Explain the idea of the lock point.\""),
);

// 7. Alignment with official description
children.push(
  H1("7. Alignment with the official course description"),
  P("Every topic in the official IDB201 description (Appendix 2(d)) is covered, so the academic orientation adds depth without dropping required content."),
  table(
    ["Official topic (Appendix 2(d))", "Chapter(s)", "Sessions"],
    [
      ["Entity-Relationship (ER) model", "C6 (DSC 6)", "27–31"],
      ["Relational data model", "C2 (DSC 2)", "4"],
      ["Relational algebra", "C2 (DSC 2.5–2.6)", "5–8"],
      ["SQL", "C3, C4, C5 (DSC 3, 4, 5)", "9–25"],
      ["Functional dependencies and normalization", "C7 (DSC 7)", "32–38"],
      ["Indexing", "C8 (DSC 13–14)", "41–44, 48"],
      ["Query optimization", "C9 (DSC 15–16)", "45–48"],
      ["Transaction management", "C10 (DSC 17–19)", "49–54"],
      ["Outcome: design normalized schemas", "C6, C7 (CLO2, CLO5)", "—"],
      ["Outcome: query databases proficiently using SQL", "C3, C4, C5 (CLO4)", "—"],
      ["Outcome: understand internal mechanisms of storage and transaction control", "C8–C10 (CLO6, CLO7)", "—"],
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
      ["Students are still learning to program", "Programming in Python is not required: labs use SQL and T-SQL only, and Python is optional self-study. T-SQL control flow (IF, WHILE, variables) comes after PFP191 has introduced the same ideas in Python."],
      ["Workload", "5 labs instead of 9 and one assignment instead of two; each constructivist-question answer is short (one per chapter); abstract sections are guided self-study with worksheets rather than extra lectures."],
      ["Research workload", "The project is built in milestones with feedback at each one; the brief suggests experiment designs, and every task has a minimum version and an extension for the strongest students."],
      ["SQL fluency for later courses", "SQL is practised in Labs 1–2 and T-SQL programming in Lab 3; both are used in Labs 4–5 and in the project, and assessed in Progress test 1 and the final exam."],
      ["System internals without a data-structures background", "B+-trees, join algorithms and transactions are taught at the level of main ideas and cost formulas; B+-tree deletion, multiple-key access and dynamic programming for join order are self-study (optional where noted), to be revisited after CSD203."],
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
    ["Why is there no practical exam?",
     "Practical SQL skill is still trained in the labs and used throughout the group project, and it is assessed in the labs, Progress test 1 and the project. The final exam (50%) remains the individual guarantee of competence."],
    ["Why does a CS course include T-SQL programming?",
     "Functions, stored procedures, triggers and cursors are skills that later courses, internships and the group project rely on. They are taught with a CS angle (declarative versus procedural enforcement, termination of triggers, set-based versus row-by-row cost), and the time comes from trimming internals topics that need CSD203 background."],
    ["How is research work graded fairly?",
     "With published rubrics; the project combines the design review, report, reproducibility, presentation and peer evaluation, and individual marks can differ based on contribution logs."],
    ["Why 8 CLOs?",
     "The template provides 8 CLO rows. Eight outcomes cover every knowledge unit of the official description, each is assessed by at least two components, and the number is manageable for a 3-credit course."],
    ["Is a research outcome (CLO8) realistic in semester 1?",
     "Yes, at a small scale. The project is staged in milestones with feedback, and the brief suggests experiment designs. CLO8 introduces research skills that ENW493c (S5) and the capstone (S9) develop further."],
    ["Why are ER design and mapping one CLO (CLO2)?",
     "They form one design process, from requirements to a relational schema, and they are assessed together in Lab 4, the project design review and Progress test 2."],
    ["Why is CLO6 at the Evaluate level?",
     "Students compare indexing and plan alternatives using measured evidence and cost models, then justify a choice. That is evaluation, not only application."],
    ["Why does IDB201 not claim PLO3 (AI and DS technologies)?",
     "IDB201 provides the data foundation that PLO3 courses rely on, but it does not teach or assess machine learning, deep learning or big-data systems. Only PLOs that the course actually assesses are claimed (§4.9)."],
    ["Why is PLO5 mapped to five CLOs?",
     "PLO5 includes research, analysis, critical thinking and problem solving, which is exactly what the academic orientation of the honors classes develops. Each link is backed by a graded component (§4.8)."],
    ["Is the workload reasonable for first-semester students?",
     "Yes. Reading is about 15 textbook pages per session on average (at most about 25), each constructivist-question answer is short (one per chapter), and abstract topics are self-study with worksheets."],
  ].flatMap(([q, a]) => [
    new Paragraph({ spacing: { before: 120, after: 60 }, children: [new TextRun({ text: "Q: " + q, bold: true, color: ACCENT })] }),
    P("A: " + a),
  ]),
);

// 10. Open items
children.push(
  H1("10. Items requiring a decision"),
  N("**Assessment weights:** approval of the proposed structure (final exam 50%; labs and CQ 10%; progress tests 5% + 5%; group project 30%; no practical exam) under the campus Course Implementation Plan."),
  N("**Next step:** once the syllabus is approved, the detailed lecture materials, labs and assignment briefs will be developed to match it."),
);

// ---- document -------------------------------------------------------------
const doc = new Document({
  creator: "IDB201 course team",
  title: "IDB201 – Academic Emphasis Brief",
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
      children: [new TextRun({ text: "IDB201 – Academic Emphasis Brief · Page ", size: 16, color: "808080" }),
                 new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "808080" })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => { fs.writeFileSync(OUT, buf); console.log("Saved " + OUT); });

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
  B("==Proofs and algorithms==: students prove core results (Armstrong's axioms, the lossless-join test, correctness of two-phase locking) and implement the algorithms in Python, linking to PFP191."),
  B("==System internals==: storage, indexing, query optimization and transaction theory analyzed with cost models, as the official description requires."),
  B("==Research practice==: every chapter has a Research Corner built around a seminal paper, labs include an Investigate part (hypothesis → experiment → evidence), and the course ends with a mini research project written as a short paper."),
  B("==Assessment aligned with the orientation==: 40% of the grade rewards research work, and the final exam includes at least 30% analysis-level items."),
  gap(),
  table(
    ["Item", "Proposal"],
    [
      ["Course", "IDB201 – Introduction to Databases (as listed in the K22A curriculum, Appendix 2(a))"],
      ["Learners", "Talented-student (honors) classes; Year 1, Semester 1; no prerequisite"],
      ["Workload", "3 credits: 45h contact (60 sessions) + 1h final exam + 104h self-study"],
      ["Textbooks", "Silberschatz, Korth & Sudarshan, Database System Concepts, 7th ed. (2020); Ramakrishnan & Gehrke, Database Management Systems, 3rd ed. (2003)"],
      ["Primary literature", "==At least one seminal paper per chapter== (Codd 1970, 1972; Chen 1976; Selinger et al. 1979; Berenson et al. 1995; Kraska et al. 2018; Stonebraker & Pavlo 2024; …)"],
      ["CLOs", "8 CLOs (one per row of the template); ==6 of 8 at the Analyze level or above== (Bloom); CLO8 is a dedicated research outcome"],
      ["PLO contribution", "PLO2, PLO5, PLO7, PLO8, PLO9, PLO10, PLO11 (7 of the 13 BCS_AD PLOs; ==PLO5 research and critical thinking is supported by 5 CLOs==)"],
      ["Assessment", "Labs 10% · Progress tests 20% · Assignment 1 10% · Assignment 2 (research project) 20% · Practical exam 10% · Final exam 30%"],
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
  ["3. Relational model and mapping", "9–13", "==Relations as sets; constraints as first-order logic; inclusion dependencies==; proof that every relation has a key; Sperner bound on the number of keys", "Codd (1970)", "CLO2"],
  ["4. Relational algebra", "14–19", "==Relational calculus (TRC/DRC), safety, Codd's theorem; limits of expressive power (transitive closure)==; Python algebra evaluator", "Codd (1972)", "CLO3"],
  ["5. SQL: data definition", "20–24", "Declarative vs. procedural integrity; ==why assertions are hard to check (incremental maintenance)==", "DSC §4.4", "CLO4"],
  ["6. SQL: queries", "25–33", "==Formal semantics of SQL: bag semantics, three-valued logic, translation to algebra==; proofs of NULL anomalies", "Chamberlin & Boyce (1974); Guagliardo & Libkin (2017)", "CLO4"],
  ["7. Data modification and views", "34–38", "View expansion; ==the view-update problem==; SQL injection explained by the separation of code and data", "Bancilhon & Spyratos (1981)", "CLO4"],
  ["8. Functional dependencies and normalization", "39–46", "==Proofs: soundness and completeness of Armstrong's axioms, correctness of closure, lossless-join test; complexity (primality is NP-complete); MVDs and 4NF==; Python FD toolkit", "Kent (1983); Armstrong (1974)", "CLO5"],
  ["9. Storage, indexing and query processing", "47–51", "==I/O cost model and cost formulas; B+-tree height analysis; System R dynamic programming for join order; cardinality estimation; learned indexes==; controlled experiments", "Selinger et al. (1979); Leis et al. (2015); Kraska et al. (2018)", "CLO6"],
  ["10. Transactions and concurrency", "52–56", "==Conflict and view serializability (NP-completeness); proof that 2PL is correct; recoverability; snapshot isolation and write skew==; Python serializability tester", "Eswaran et al. (1976); Berenson et al. (1995)", "CLO7"],
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
    ["Course", "Semester", "Connection used in IDB201"],
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
const Y = "✓";
children.push(
  new Paragraph({ children: [new PageBreak()] }),
  H1("4. Course learning outcomes (CLOs)"),
  P("Eight CLOs are proposed, one for each CLO row of the university template. They were derived from four sources: the **official course description** (Appendix 2(d)), the **two textbooks**, the **courses of the 9-semester BCS_AD program that build on IDB201**, and the **academic orientation** of the honors classes. Six of the eight are at the **Analyze level or above**, and CLO8 is a dedicated research outcome."),
  H2("4.1 CLO statements"),
  table(
    ["CLO", "Description", "Bloom level", "Chapters"],
    [
      ["CLO1", "Explain the fundamental concepts of database systems (data models, schemas and instances, the three-schema architecture, data independence, DBMS components) and relate them to the research contributions that introduced them.", "Understand", "1"],
      ["CLO2", "Design a database from requirements: build an Entity-Relationship model, justify design alternatives, and map it to a relational schema whose keys and integrity constraints are specified precisely, including as logical statements.", "Create", "2, 3, 5"],
      ["CLO3", "Formulate queries in relational algebra and relational calculus, prove simple equivalences between expressions, and explain the limits of their expressive power.", "Analyze", "4, 6"],
      ["CLO4", "Use SQL to define, populate, modify and query relational databases (joins, aggregation, subqueries, views, access from Python) and explain query results through SQL semantics (bag semantics, three-valued logic).", "Apply", "5, 6, 7"],
      ["CLO5", "Analyze and improve relational schemas with functional dependency theory: compute closures, candidate keys and minimal covers, prove basic properties, decompose to 3NF/BCNF with lossless-join and dependency-preservation guarantees, and implement these algorithms in Python.", "Analyze", "8"],
      ["CLO6", "Evaluate physical design and query execution choices (storage organization, indexes, join algorithms, execution plans) using I/O cost models and controlled experiments.", "Evaluate", "9"],
      ["CLO7", "Analyze concurrent executions for conflict serializability and recoverability, and justify concurrency-control and recovery mechanisms (two-phase locking, isolation levels, write-ahead logging).", "Analyze", "10"],
      ["CLO8", "Conduct a small, reproducible research study on a database topic: review primary literature, formulate a research question or hypothesis, design and carry out an experiment or implementation, and report the results in an academic paper and presentation.", "Create", "Research Corners; Assignments 1–2"],
    ],
    [800, 5626, 1200, 1400],
    { highlightRows: [1, 2, 4, 5, 6, 7] },
  ),
  gap(),
  H2("4.2 How the CLOs were derived"),
  N("**Official course description.** Its three outcome statements are covered directly: \"design normalized database schemas\" → CLO2 and CLO5; \"query databases proficiently using SQL\" → CLO4; \"understand the internal mechanisms of storage and transaction control\" → CLO6 and CLO7."),
  N("**Textbooks.** The CLOs follow the main knowledge units shared by Silberschatz et al. (2020) and Ramakrishnan & Gehrke (2003): foundations, design, formal query languages, SQL, dependency theory, storage and query processing, and transactions."),
  N("**The 9-semester program.** Each CLO prepares for named later courses (§4.4). IDB201 is the entry point of the program skill set \"Data Handling, Databases and Data Mining\"."),
  N("**Academic orientation.** ==Formal reasoning (CLO3), proofs and algorithm implementation (CLO5), experimental evaluation (CLO6), correctness arguments (CLO7) and a full research cycle (CLO8)== raise the level above a standard, application-oriented course."),
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
      ["CLO1", "1", "1–3; reviewed in 19 and 60"],
      ["CLO2", "2, 3 (and constraints in 5)", "4–13, 23–24; Assignment 1 defense in 38"],
      ["CLO3", "4 (and SQL semantics in 6)", "14–19, 33; Assignment 1 defense in 38"],
      ["CLO4", "5, 6, 7", "20–37, 46"],
      ["CLO5", "8", "39–46"],
      ["CLO6", "9", "47–51; Assignment 2 in 58–59"],
      ["CLO7", "10", "52–56; Assignment 2 in 58–59"],
      ["CLO8", "Research Corner in every chapter; Assignments 1–2", "38, 51, 57–60, plus the Investigate part of every lab"],
    ],
    [800, 3700, 4526],
  ),
  gap(),
  H2("4.6 CLO – assessment matrix"),
  P("Every CLO is assessed by at least two components, and every component assesses at least one CLO."),
  table(
    ["CLO", "Labs 10%", "PT1 10%", "PT2 10%", "Asm 1 10%", "Asm 2 20%", "PE 10%", "FE 30%"],
    [
      ["CLO1", "", Y, "", "", "", "", Y],
      ["CLO2", Y, Y, "", Y, "", "", Y],
      ["CLO3", Y, Y, "", Y, "", "", Y],
      ["CLO4", Y, "", Y, "", "", Y, Y],
      ["CLO5", Y, "", Y, "", Y, "", Y],
      ["CLO6", Y, "", "", "", Y, "", Y],
      ["CLO7", Y, "", "", "", Y, "", Y],
      ["CLO8", Y, "", "", Y, Y, "", ""],
    ],
    [1026, 1100, 1100, 1100, 1200, 1200, 1100, 1200],
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
      ["CLO1–CLO7 → PLO2", "IDB201 is a foundation course: it gives the data-management knowledge (relational model, SQL, normalization, storage, transactions) and the standard tool (SQL/DBMS) that later AI and DS courses build on.", "Progress tests, final exam, practical exam"],
      ["CLO2, CLO3, CLO5, CLO6 → PLO5", "==The academic orientation==: students analyze requirements and justify designs (CLO2), prove equivalences (CLO3), prove and apply dependency theory (CLO5), and form hypotheses and test them experimentally (CLO6).", "Written reasoning items, Assignment 1, Investigate parts of the labs"],
      ["CLO8 → PLO5", "A complete, small research project: literature, question, method, results.", "Assignment 2 paper"],
      ["CLO4, CLO5 → PLO8", "Proficient use of SQL and of a DBMS; Python access to databases (CLO4) and Python implementations of FD algorithms (CLO5).", "Labs 4–7, practical exam, unit-tested Python tasks"],
      ["CLO6 → PLO9", "Students apply and evaluate modern techniques (indexing, cost-based optimization) and read recent research such as learned indexes (Kraska et al., 2018).", "Lab 8, Assignment 2"],
      ["CLO8 → PLO7", "Research results are communicated as an IEEE-style paper and a 15-minute presentation with Q&A.", "Assignment 2 paper and presentation; Assignment 1 oral defense"],
      ["CLO8 → PLO10", "Individual work (Assignment 1) and group work with contribution logs and peer evaluation (Assignment 2); self-study of primary literature.", "Assignment 1, Assignment 2 peer evaluation"],
      ["CLO8 → PLO11", "Research integrity: reproducible code and data, correct citation, and mandatory disclosure of generative-AI use.", "Assignment 2 reproducibility criterion (20%)"],
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
      ["PLO6", "Language proficiency is assessed in the English and Japanese courses. IDB201 is taught in English with English readings, which supports PLO6 indirectly without assessing it."],
      ["PLO12", "Physical education and cultural identity are covered by the PE and traditional-instrument courses."],
    ],
    [1500, 7526],
  ),
  P("Claiming only the PLOs that IDB201 actually assesses keeps the program-level CLO–PLO matrix credible for accreditation."),
);

// 5. Assessment
children.push(
  H1("5. Proposed assessment structure"),
  P("The weights follow the component types of the university template (labs, progress tests, assignments, practical exam, final exam) and keep the completion criteria unchanged. The balance is shifted from the applied practical exam towards research work."),
  table(
    ["Component", "Standard template", "Proposal", "Format", "CLOs"],
    [
      ["Research labs (8)", "–", "==10%==", "Lab exercises, Python implementations with tests, Investigate mini-reports", "CLO2–CLO8"],
      ["Progress test 1", "10%", "10%", "30': 20 MCQ + 2 written reasoning items (ch. 1–4)", "CLO1–CLO3"],
      ["Progress test 2", "10%", "10%", "30': 20 MCQ + 2 written reasoning items (ch. 5–8)", "CLO4–CLO5"],
      ["Assignment 1", "10%", "10%", "Individual technical report (4–6 pages) + oral defense", "CLO2, CLO3, CLO8"],
      ["Assignment 2", "10%", "==20%==", "Group mini research project: short paper (IEEE), reproducible code, presentation", "CLO5–CLO8"],
      ["Practical exam", "30%", "==10%==", "60' SQL on computer (ch. 5–7)", "CLO4"],
      ["Final exam", "30%", "30%", "60', 50 MCQ; ==≥ 30% analysis-level items==", "CLO1–CLO7"],
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
  P("Every topic in the official IDB201 description (Appendix 2(d)) is covered, so the academic orientation adds depth without dropping required content."),
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
      ["Outcome: design normalized schemas", "2, 3, 8 (CLO2, CLO5)", "—"],
      ["Outcome: query databases proficiently using SQL", "5–7 (CLO4)", "—"],
      ["Outcome: understand internal mechanisms of storage and transaction control", "9, 10 (CLO6, CLO7)", "—"],
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
    ["Why 8 CLOs?",
     "The template provides 8 CLO rows. Eight outcomes cover every knowledge unit of the official description, each is assessed by at least two components, and the number is manageable for a 3-credit course."],
    ["Is a research outcome (CLO8) realistic in semester 1?",
     "Yes, at a small scale. Assignment 1 gives the experimental design, and only Assignment 2 asks students to design their own study. CLO8 introduces research skills that ENW493c (S5) and the capstone (S9) develop further."],
    ["Why are ER design and mapping one CLO (CLO2)?",
     "They form one design process, from requirements to a relational schema, and they are assessed together in Assignment 1 and Progress test 1."],
    ["Why is CLO6 at the Evaluate level?",
     "Students compare indexing and plan alternatives using measured evidence and cost models, then justify a choice. That is evaluation, not only application."],
    ["Why does IDB201 not claim PLO3 (AI and DS technologies)?",
     "IDB201 provides the data foundation that PLO3 courses rely on, but it does not teach or assess machine learning, deep learning or big-data systems. Only PLOs that the course actually assesses are claimed (§4.9)."],
    ["Why is PLO5 mapped to five CLOs?",
     "PLO5 includes research, analysis, critical thinking and problem solving, which is exactly what the academic orientation of the honors classes develops. Each link is backed by a graded component (§4.8)."],
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
  N("**Assessment weights:** approval of the proposed shift (practical exam 30% → 10%; research labs 10%; Assignment 2 20%) under the campus Course Implementation Plan."),
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

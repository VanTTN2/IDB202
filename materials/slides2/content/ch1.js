// Chapter 1 – Course introduction and database-system concepts (sessions 1–3)
const L = require("../lib");
const { HEX, X0, CW } = L;
const src = (x) => `Source: DSC 7th ed., ${x}`;

module.exports = {
  n: 1,
  title: "Course introduction and database-system concepts",
  textbook: "DSC Ch. 1, §1.1–1.7, pp. 1–23; self-study §1.8–1.9, pp. 24–28; Appendix A (university schema).",
  clos: ["CLO1"],
  objectives: [
    "Explain why database systems replaced file-processing systems",
    "Distinguish the physical, logical and view levels, and schemas from instances",
    "Explain physical and logical data independence",
    "Describe the parts of a database engine: query processor, storage manager, transaction manager",
    "Install SQL Server and load the course database University",
  ],
  sessions: [
    { n: 1, name: "Course and data", sum: "Syllabus and assessment; 1.1 applications; 1.2 purpose; 1.3 view of data",
      slides: [
        { k: "cards", h: "IDB201 at a glance", src: "IDB201 syllabus", num: false, cards: [
          ["Course", "3 credits, 60 sessions of 45 minutes; semester 1; no prerequisite"],
          ["Orientation", "Academic and research-oriented: formal foundations, algorithms, correctness, system internals"],
          ["Textbook and tool", "Database System Concepts, 7th ed. (DSC); Microsoft SQL Server 2022 with SSMS"],
          ["How we work", "Read the DSC sections before class; guided self-study; constructivist questions"]] },
        { k: "table", h: "Course learning outcomes (1/2)", src: "IDB201 syllabus, sheet CLO", size: 20, rowH: 0.98, colW: [1.4, 10.73], rows: [
          ["CLO", "Students will be able to …"],
          ["CLO1", "Explain the fundamental concepts of database systems and relate them to the research that introduced them"],
          ["CLO2", "Design a database from requirements with the E-R model and map it to a relational schema with precise keys and constraints"],
          ["CLO3", "Formulate relational-algebra queries, check simple equivalences, and explain what the algebra cannot express"],
          ["CLO4", "Write correct SQL and T-SQL, and explain how NULLs and duplicates affect the results"]] },
        { k: "table", h: "Course learning outcomes (2/2)", src: "IDB201 syllabus, sheet CLO", size: 20, rowH: 0.98, colW: [1.4, 10.73], rows: [
          ["CLO", "Students will be able to …"],
          ["CLO5", "Analyze and improve schemas with functional-dependency theory; decompose into 3NF/BCNF"],
          ["CLO6", "Evaluate storage, indexes, join algorithms and execution plans with I/O cost models and experiments"],
          ["CLO7", "Analyze concurrent executions for serializability and recoverability; justify concurrency control and recovery"],
          ["CLO8", "Conduct a small reproducible study in a team, with academic integrity and responsible use of AI tools"]] },
        { k: "table", h: "Assessment", src: "IDB201 syllabus, sheet Grading structure", size: 20, rowH: 0.62, colW: [4.0, 1.3, 6.83], rows: [
          ["Component", "Weight", "What it involves"],
          ["5 labs + 9 CQ answers", "10%", "Labs 6% (1.2% each); CQ answers 4%"],
          ["Progress test 1 (session 26)", "5%", "Chapters 1–5; 20 multiple-choice questions, 30 minutes"],
          ["Progress test 2 (session 56)", "5%", "Chapters 6–10; 20 questions, 30 minutes"],
          ["Group project (3–4 students)", "30%", "Milestones in s. 39 and 52; presentations s. 57–58"],
          ["Final exam", "50%", "50 questions, 60 minutes, all chapters"]],
          note: "Pass: every component > 0, final exam ≥ 5, final result ≥ 5. Attend ≥ 80% of sessions to sit the exam." },
        { k: "cards", h: "What “research-oriented” means here", src: "IDB201 syllabus, Description and teaching method", cards: [
          ["Ask why", "Every technique is explained by the problem it solves and by its limits"],
          ["Reason precisely", "Check claims with definitions and small counterexamples"],
          ["Experiment", "Labs and the project test hypotheses with measurements"],
          ["Write it up", "The project ends with an academic report that cites related work"]] },
        { k: "bul", h: "1.1 Database-system applications", src: src("§1.1"), items: [
          "A DBMS is a collection of interrelated data and a set of programs to access those data",
          "Goal: store and retrieve information conveniently and efficiently, and keep it safe",
          "Used in banking, universities, airlines, telecommunications, web services, navigation",
          "Two modes of use: online transaction processing and data analytics"],
          right: { card: ["Running example", "Like DSC, this course uses a university database: departments, instructors, students, courses, sections and enrollments (DSC Appendix A)."] } },
        { k: "cards", h: "1.2 Why not keep data in files?", src: src("§1.2"), cols: 3, cards: [
          ["Redundancy", "The same data in several files; copies drift apart"],
          ["Access", "Each new request needs a new program"],
          ["Isolation", "Data scattered in files of different formats"],
          ["Integrity", "Rules buried in application code"],
          ["Atomicity", "A crash mid-transfer leaves data half-updated"],
          ["Concurrency, security", "Simultaneous updates interfere; access is hard to restrict"]] },
        { k: "bul", h: "1.3 Data models", src: src("§1.3"), items: [
          "A data model describes data, relationships, semantics and constraints",
          "Relational model: tables (relations); the most widely used",
          "Entity-relationship model: used for design (Chapter 6)",
          "Semi-structured model: JSON, XML",
          "Object-based model: object ideas inside relational systems"],
          right: { card: ["Course focus", "The relational model: its mathematics (Ch. 2), its languages (Ch. 2–5) and its design theory (Ch. 7)."], fill: HEX.pale } },
        { k: "draw", h: "1.3 Three levels of data abstraction", src: "Diagram drawn for IDB201 after DSC 7th ed., §1.3", draw: (s) => {
          ["View 1", "View 2", "…", "View n"].forEach((v, i) => L.node(s, v, 0.9 + i * 2.15, 1.5, 1.9, 0.8, { fill: HEX.pale }));
          L.node(s, "Logical level: relations, attributes, constraints", 0.9, 3.2, 8.35, 0.9);
          L.node(s, "Physical level: files, blocks, indexes", 0.9, 5.0, 8.35, 0.9, { fill: HEX.paleOrange });
          [1.85, 4.0, 8.3].forEach((x) => L.arrow(s, x, 2.3, x, 3.2, { noHead: true, color: HEX.grey }));
          L.arrow(s, 5.1, 4.1, 5.1, 5.0, { noHead: true, color: HEX.grey });
          L.text(s, "logical data independence", 9.6, 2.45, 3.2, 0.9, { fontSize: 20, color: HEX.navy, bold: true });
          L.text(s, "physical data independence", 9.6, 4.25, 3.2, 0.9, { fontSize: 20, color: HEX.orange, bold: true });
        } },
        { k: "bul", h: "1.3 Schemas and instances", src: src("§1.3; rows from the course database University"), leftW: 5.6, items: [
          "Schema: the overall design; changes rarely",
          "Instance: the data at one moment; changes all the time",
          "Physical data independence: programs need not change when the physical schema changes"],
          right: { x: 6.5, w: 6.2, mono: true, size: 18, rowH: 0.55, colW: [1.1, 1.3, 2.1, 1.7], table: [
            ["ID", "name", "dept_name", "salary"], ["I1001", "Nguyen", "Comp. Sci.", "92000"], ["I2001", "Pham", "Mathematics", "88000"],
            ["I3001", "Curie", "Physics", "95000"], ["I4001", "Mendel", "Biology", "72000"], ["I5001", "Keynes", "Economics", "80000"]] } },
      ] },
    { n: 2, name: "Languages and engine", sum: "1.4 languages; 1.5 design; 1.6 engine; 1.7 architectures; self-study §1.8–1.9",
      slides: [
        { k: "cards", h: "1.4 Database languages", src: src("§1.4"), cards: [
          ["DDL", ["Defines the schema and its constraints", "Domain, referential integrity, authorization", "Stored in the data dictionary (metadata)"]],
          ["DML", ["Retrieves, inserts, deletes and modifies data", "A query language is the retrieval part", "SQL is both a DDL and a DML"]]] },
        { k: "cards", h: "1.4 Procedural and declarative DML", src: src("§1.4"), cards: [
          ["Procedural", "The user says what data are needed and how to get them (loops over records)"],
          ["Declarative", "The user says only what data are needed; the system finds a way"],
          ["Why it matters", "The optimizer chooses the access path (Chapter 9), so programs survive physical changes", HEX.paleOrange]] },
        { k: "code", h: "SQL as a DDL and a DML", src: src("§1.4"), codeW: 6.8, code:
"-- DDL: define a relation schema\ncreate table department\n (dept_name varchar(20),\n  building  varchar(15),\n  budget    numeric(12,2),\n  primary key (dept_name));\n\n-- DML: a declarative query\nselect name\nfrom   instructor\nwhere  dept_name = 'Physics';",
          items: ["The query says what is wanted, not how to find it", "The primary key is a constraint the DBMS enforces", "Applications send SQL through APIs such as ODBC and JDBC (§5.1)"] },
        { k: "code", h: "1.4 The data dictionary (metadata)", src: src("§1.4; SQL Server catalog views (sys.tables, sys.columns)"), codeW: 6.8, code:
"-- data about data, in SQL Server\nselect t.name as table_name,\n       c.name as column_name\nfrom   sys.tables  t\njoin   sys.columns c\n  on   c.object_id = t.object_id\nwhere  t.name = 'instructor';",
          items: ["The DDL output is stored as metadata", "The DBMS reads it to check every query", "It can be queried like ordinary data"] },
        { k: "draw", h: "1.5 Database design", src: src("§1.5"), draw: (s) => {
          [["Requirements", "Data needs of the users"], ["Conceptual design", "E-R diagram (Ch. 6)"], ["Logical design", "Relational schemas (Ch. 6–7)"], ["Physical design", "Files, indexes (Ch. 8)"]].forEach((c, i) => {
            const x = X0 + i * 3.1;
            L.node(s, c[0], x, 1.8, 2.7, 1.0, { fill: i === 1 || i === 2 ? HEX.pale : HEX.white });
            L.text(s, c[1], x, 3.0, 2.7, 1.2, { fontSize: 20, align: "center" });
            if (i < 3) L.arrow(s, x + 2.7, 2.3, x + 3.1, 2.3, { color: HEX.orange });
          });
          L.autoCard(s, X0, 4.6, CW, 1.9, null, "Design also asks which entities to store and how they relate, and must avoid redundancy and incompleteness.", "1.5", { fill: HEX.paleOrange });
        } },
        { k: "bul", h: "1.6 The storage manager", src: src("§1.6"), items: [
          "Interface between the stored data and programs and queries",
          "Implements data files, the data dictionary and indices",
          "Reads and writes blocks through the file manager and the buffer manager"],
          right: { card: ["Components", ["Authorization and integrity manager", "Transaction manager", "File manager", "Buffer manager"]], fill: HEX.pale } },
        { k: "draw", h: "1.6 The query processor", src: "Diagram drawn for IDB201 after DSC 7th ed., §1.6 and §15.1", draw: (s) => {
          const steps = ["SQL query", "DML compiler\n(parse, check)", "Optimizer\n(choose a plan)", "Evaluation\nengine", "Result"];
          steps.forEach((t, i) => { const x = 0.7 + i * 2.5; L.node(s, t, x, 2.0, 2.1, 1.3, { size: 20, fill: i === 2 ? HEX.paleOrange : HEX.white });
            if (i < 4) L.arrow(s, x + 2.1, 2.65, x + 2.5, 2.65); });
          L.autoBullets(s, ["The DDL interpreter records definitions in the data dictionary",
            "Transactions are single logical units of work: ACID (Chapter 10)"], X0, 4.0, CW, 2.5, "1.6 qp");
        } },
        { k: "draw", h: "Architecture of a database system", src: "Diagram drawn for IDB201 after DSC 7th ed., §1.6–1.7", draw: (s) => {
          ["Administrator", "Analysts (SQL)", "Application programs", "End users"].forEach((t, i) => L.node(s, t, 0.7 + i * 3.05, 1.45, 2.8, 0.7, { size: 18, fill: HEX.pale }));
          L.node(s, "Query processor: DDL interpreter · DML compiler and optimizer · evaluation engine", 0.7, 2.55, 11.95, 0.85, { size: 20 });
          L.node(s, "Storage manager: authorization · transactions · files · buffer", 0.7, 3.8, 11.95, 0.85, { size: 20 });
          ["Data files", "Indices", "Data dictionary", "Statistics"].forEach((t, i) => L.node(s, t, 0.7 + i * 3.05, 5.15, 2.8, 0.8, { size: 18, fill: HEX.paleOrange, shape: "flowChartMagneticDisk" }));
          L.arrow(s, 6.67, 2.15, 6.67, 2.55); L.arrow(s, 6.67, 3.4, 6.67, 3.8); L.arrow(s, 6.67, 4.65, 6.67, 5.15);
        } },
        { k: "draw", h: "1.7 Two-tier and three-tier architectures", src: src("§1.7"), draw: (s) => {
          L.text(s, "Two-tier", 0.8, 1.45, 5.4, 0.5, { bold: true, color: HEX.navy, align: "center" });
          L.text(s, "Three-tier", 6.9, 1.45, 5.8, 0.5, { bold: true, color: HEX.navy, align: "center" });
          L.node(s, "Client application", 1.8, 2.1, 3.4, 0.9); L.node(s, "Database server", 1.8, 4.3, 3.4, 0.9, { fill: HEX.paleOrange });
          L.arrow(s, 3.5, 3.0, 3.5, 4.3, { label: "ODBC / JDBC", lx: 3.65, ly: 3.45, lw: 2.2, lalign: "left" });
          L.node(s, "Browser or app", 8.1, 1.95, 3.4, 0.8); L.node(s, "Application server", 8.1, 3.3, 3.4, 0.8, { fill: HEX.pale }); L.node(s, "Database server", 8.1, 4.65, 3.4, 0.8, { fill: HEX.paleOrange });
          L.arrow(s, 9.8, 2.75, 9.8, 3.3); L.arrow(s, 9.8, 4.1, 9.8, 4.65);
          L.text(s, "Typical for web applications: business rules live in the middle tier", 6.9, 5.75, 5.8, 0.8, { fontSize: 20, align: "center", color: HEX.grey });
          L.text(s, "Also: centralized, parallel and distributed systems", 0.8, 5.75, 5.4, 0.8, { fontSize: 20, align: "center", color: HEX.grey });
        } },
        { k: "cards", h: "Self-study: DSC §1.8–1.9", src: "Self-study source: DSC 7th ed., §1.8–1.9, pp. 24–28", cards: [
          ["§1.8 Users and administrators", "Naive users, application programmers, sophisticated users; the database administrator and their tasks"],
          ["§1.9 History", "From punched cards and tapes, through hierarchical and network models, to Codd's relational model and cloud systems"],
          ["Reading tip", "Note which problem each generation tried to solve: this prepares CQ1.2. Assessed in PT1 and the final exam.", HEX.paleOrange]] },
      ] },
    { n: 3, name: "Discussion and set-up", sum: "CQ1.1–CQ1.3; install SQL Server and SSMS; load the university database",
      slides: [
        { k: "plan", h: "Plan of session 3", src: "IDB201 syllabus, session 3", rows: [
          ["CQ1.1–CQ1.3", "Discussion in groups, then whole class", "20 min"],
          ["How to answer", "What a good CQ answer looks like", "5 min"],
          ["Tool set-up", "Install SQL Server and SSMS; load University (not graded)", "17 min", true],
          ["Quick check", "Three questions on Chapter 1", "3 min"]] },
        { k: "cq", id: "CQ1.1", look: "Where to look: DSC 7th ed., §1.3, §1.9", prompts: [
          "What changes in a program when a file is reorganized or an index is added?",
          "Connect your answer to physical data independence (§1.3)",
          "Give one concrete example from the university database"] },
        { k: "cq", id: "CQ1.2", look: "Where to look: DSC 7th ed., §1.3, §1.9", prompts: [
          "Which problem did each new model try to solve?",
          "What do users eventually ask for: declarative queries, constraints, transactions?",
          "Is a new model a replacement or an extension?"] },
        { k: "cq", id: "CQ1.3", look: "Where to look: DSC 7th ed., §1.2, §1.6", prompts: [
          "Think of the costs of a DBMS: set-up, administration, overhead",
          "Which file-processing problems of §1.2 does your example not have?",
          "Justify with the characteristics of the data and the users"] },
        { k: "cards", h: "What a good CQ answer looks like", src: "IDB201 syllabus, Grading structure (CQ answers)", cards: [
          ["Claim", "State your answer in one sentence"],
          ["Justify", "Use the textbook: cite the section, explain it in your own words"],
          ["Example", "Give one concrete case, preferably from the university database"]],
          note: "One answer per chapter, 150–200 words, on the LMS within one week. The 9 answers count for 4% of the course grade." },
        { k: "cards", h: "Tool set-up (not graded): install", src: "IDB201 syllabus, Tools; Setup guide", cards: [
          ["SQL Server 2022", "Developer or Express edition; default instance; Windows authentication"],
          ["SSMS", "SQL Server Management Studio, latest version"],
          ["Connect", "Server name: localhost (or .\\SQLEXPRESS for Express)"]],
          note: "Problems? Follow IDB201_Setup_Guide.docx step by step and bring screenshots of any error." },
        { k: "code", h: "Load the course database University", src: "givenDB script university_sqlserver.sql; schema of DSC 7th ed., Appendix A", codeW: 6.8, code:
"-- in SSMS: File > Open > university_sqlserver.sql\n-- then Execute (F5)\n\n-- it drops and recreates\n-- the database University\nuse University;\nselect name from sys.tables\norder by name;",
          card: ["Expected tables", "advisor, classroom, course, department, instructor, prereq, section, student, takes, teaches, time_slot"] },
        { k: "code", h: "Check that it works", src: "Data of the course database University (givenDB)", codeW: 6.8, code:
"select * from department;\n\nselect name\nfrom   instructor\nwhere  dept_name = 'Physics';",
          card: ["Expected", "6 departments (Philosophy has no instructor). The Physics query returns Curie and Bohr."] },
        { k: "quick", h: "Quick check: Chapter 1", src: "Questions written for IDB201 on DSC 7th ed., §1.2–1.6",
          qs: ["Which file-processing problem: one address updated in only one of two files?",
               "An index is added on instructor(name). Must the applications change? Which property is this?",
               "Which component of the engine chooses how a declarative query is executed?"],
          ans: "1 redundancy leading to inconsistency; 2 no, physical data independence; 3 the query optimizer (DML compiler)." },
      ] },
  ],
  back: [
    { k: "list", h: "Practice exercises", src: "Exercises written for IDB201; more: DSC Practice Exercises 1.1–1.5, p. 34", items: [
      "Name three things SQL Server does for the instructor table that a program on a plain file must do itself.",
      "Physical or logical? (a) index on instructor(name); (b) new attribute email; (c) data files moved to an SSD.",
      "On University: how many instructors does each department have?"] },
    { k: "list", h: "Practice exercises: answers", src: "Answers written for IDB201 on DSC 7th ed., §1.2–1.3 and the University data", fill: HEX.pale, items: [
      "Enforce keys and foreign keys; let several users update without lost updates; undo a half-finished update after a crash.",
      "(a) and (c) physical: programs keep working. (b) logical: programs using select * may break; a view can hide it.",
      "select dept_name, count(*) from instructor group by dept_name: Biology 2, Comp. Sci. 4, Economics 2, Mathematics 2, Physics 2."] },
    { k: "cards", h: "Summary", src: "DSC 7th ed., Ch. 1", cols: 3, num: false, cards: [
      ["DBMS", "Interrelated data plus programs; solves the problems of files"],
      ["Data models", "The relational model is the focus of the course"],
      ["Abstraction", "Three levels; physical and logical data independence"],
      ["Languages", "DDL for schemas and constraints; declarative DML (SQL)"],
      ["Engine", "Query processor, storage manager, transaction management"],
      ["Design", "Requirements, conceptual, logical, physical design", HEX.paleOrange]] },
    { k: "cards", h: "Before the next session", src: "IDB201 syllabus, sessions 3–4", cards: [
      ["Within one week", "Choose one of CQ1.1–CQ1.3 and submit your answer on the LMS"],
      ["Tools", "Finish the set-up; run the two check queries", HEX.paleOrange],
      ["Session 4", "Read DSC Ch. 2, §2.1–2.4, pp. 37–46"]] },
  ],
};

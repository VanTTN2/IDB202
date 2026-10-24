// Chapter 1 – Course introduction and database systems (sessions 1, 2, 3; CQ1.1–CQ1.3)
module.exports = {
  num: 1,
  title: "Course introduction and database-system concepts",
  short: "Introduction",
  sessions: [1, 2, 3],
  reading: "Ch. 1, §1.1–1.7, pp. 1–23; Appendix A",
  slides: [
    { t: "outline", title: "Chapter 1 roadmap", items: [
      { session: 1, head: "Course and data", points: ["Syllabus, assessment and how we work", "1.1 Database-system applications", "1.2 Purpose of database systems", "1.3 View of data"] },
      { session: 2, head: "Languages and engine", points: ["1.4 Database languages", "1.5 Database design", "1.6 Database engine", "1.7 Database and application architecture"] },
      { session: 3, head: "Discussion and set-up", points: ["Constructivist questions CQ1.1–CQ1.3", "Install SQL Server and SSMS", "Load the sample university database (DSC Appendix A)"] },
    ] },

    // ---------------- Session 1 ----------------
    { t: "session", n: 1, title: "Course introduction; database-system applications, purpose of database systems, view of data", reading: "DSC Ch. 1, §1.1–1.3, pp. 1–12" },
    { t: "cards", title: "IDB201 at a glance", items: [
      { head: "Course", body: ["3 credits, 60 sessions × 45 minutes", "Semester 1, no prerequisite", "Textbook: Database System Concepts, 7th ed. (DSC)"] },
      { head: "Orientation", body: ["Academic and research-oriented", "Formal foundations, algorithms, correctness and system internals", "Tool: Microsoft SQL Server with SSMS"] },
      { head: "Working style", body: ["Read the assigned DSC sections before each theory session", "Guided self-study for abstract topics", "Constructivist questions at the end of each chapter"] },
    ] },
    { t: "table", title: "Course learning outcomes (CLOs)", size: 13, colW: [1.1, 11.2], head: ["CLO", "Students will be able to …"], rows: [
      ["CLO1", "Explain the fundamental concepts of database systems and relate them to the research contributions that introduced them"],
      ["CLO2", "Design a database from requirements: E-R model, justified alternatives, relational schema with precise keys and constraints"],
      ["CLO3", "Formulate queries in relational algebra and relational calculus, prove simple equivalences, explain limits of expressive power"],
      ["CLO4", "Independently write correct SQL and T-SQL, from joins and nested subqueries to views, procedures and triggers; explain NULLs and duplicates"],
      ["CLO5", "Analyze and improve schemas with functional-dependency theory; decompose to 3NF/BCNF with lossless join and dependency preservation"],
      ["CLO6", "Evaluate physical design and query execution choices using I/O cost models and controlled experiments"],
      ["CLO7", "Analyze schedules for serializability and recoverability; justify locking, isolation levels and write-ahead logging"],
      ["CLO8", "Conduct a small, reproducible research study and report it academically"],
    ] },
    { t: "table", title: "Assessment", colW: [4.2, 1.4, 6.7], head: ["Component", "Weight", "What it involves"], rows: [
      ["Labs (5) and constructivist-question answers (9)", "10%", "Labs 6% (1.2% each); CQ answers 4% in total"],
      ["Progress test 1 (session 26)", "5%", "Chapters 1–5; 20 MCQ + 2 written items, 30 minutes"],
      ["Progress test 2 (session 40)", "5%", "Chapters 6–7; 20 MCQ + 2 written items, 30 minutes"],
      ["Assignment: group project (3–4 students)", "30%", "Design one database for your domain, then answer research questions by experiment; 2 milestones and a final presentation"],
      ["Final exam", "50%", "50 MCQ, 60 minutes, all chapters including self-study (about 20% of items)"],
    ], caption: "Completion: every on-going component > 0; final exam ≥ 5 and final result ≥ 5. Attend at least 80% of sessions to sit the final exam." },
    { t: "cards", title: "What “research-oriented” means in this course", items: [
      { head: "Ask why", body: "Every technique is explained by the problem it solves and by its limits." },
      { head: "Reason formally", body: "Short proofs: algebra equivalences, FD theory, serializability." },
      { head: "Experiment", body: "Labs and the project use hypotheses, measurements and evidence (the ‘Investigate’ parts)." },
      { head: "Write it up", body: "The group project ends with an academic report that cites related work." },
    ] },
    { t: "bullets", title: "1.1 Database-system applications", bullets: [
      "A database-management system (DBMS) is a collection of interrelated data and a set of programs to access those data",
      "Goal: store and retrieve information conveniently and efficiently, and keep it safe despite crashes and unauthorized access",
      "Applications are everywhere: enterprise information (sales, accounting, human resources), manufacturing, banking and finance, universities, airlines, telecommunications, web services, document databases, navigation systems",
      "Two modes of use: online transaction processing (many users, small updates) and data analytics (drawing conclusions from large volumes of data)",
    ], card: { head: "Running example", body: "Like the textbook, this course uses a university database: departments, instructors, students, courses, sections and enrollments (DSC Appendix A)." } },
    { t: "cards", title: "1.2 Purpose of database systems: why not files?", items: [
      { head: "Redundancy and inconsistency", body: "The same data stored in several files; copies drift apart." },
      { head: "Difficulty accessing data", body: "Each new request needs a new program." },
      { head: "Data isolation", body: "Data scattered across files in different formats." },
      { head: "Integrity problems", body: "Consistency rules buried in application code; hard to add or change." },
      { head: "Atomicity problems", body: "A failure in the middle of a transfer can leave data half-updated." },
      { head: "Concurrent-access anomalies and security", body: "Simultaneous updates interfere; hard to restrict who sees what." },
    ], notes: "These are the classic problems listed in DSC §1.2. Each later chapter answers one of them: integrity constraints (Ch. 4), transactions and concurrency control (Ch. 10), authorization (self-study §4.7)." },
    { t: "bullets", title: "1.3 View of data: data models", bullets: [
      "A data model is a collection of conceptual tools for describing data, data relationships, data semantics and consistency constraints",
      { b: "Relational model:", t: "a collection of tables (relations); the most widely used model" },
      { b: "Entity-relationship model:", t: "entities and relationships; widely used for database design (Chapter 6)" },
      { b: "Semi-structured model:", t: "items of the same type may have different attributes (e.g. JSON, XML)" },
      { b: "Object-based model:", t: "object-oriented ideas integrated into relational systems" },
    ], card: { head: "Course focus", body: "The relational model is the core of IDB201: its mathematics (Chapter 2), its languages (Chapters 2–5) and its design theory (Chapter 7)." } },
    { t: "twocol", title: "1.3 Data abstraction and instances vs. schemas", left: { head: "Three levels of abstraction", items: [
      { b: "Physical level:", t: "how the data are actually stored (complex low-level structures)" },
      { b: "Logical level:", t: "what data are stored and what relationships exist among them" },
      { b: "View level:", t: "only part of the database, tailored to a group of users" },
    ] }, right: { head: "Schema and instance", items: [
      { b: "Schema:", t: "the overall design of the database; changes rarely" },
      { b: "Instance:", t: "the information stored at a particular moment; changes all the time" },
      { b: "Physical data independence:", t: "application programs do not change when the physical schema changes" },
    ] }, notes: "Link to CQ1.1: physical data independence is exactly what applications would lose if they had to know how and where each record is stored." },
    { t: "code", title: "Example: a relation in the university database", side: "Reading the table", code:
"instructor\n\nID     | name        | dept_name   | salary\n-------+-------------+-------------+--------\n22222  | Einstein    | Physics     | 95000\n12121  | Wu          | Finance     | 90000\n32343  | El Said     | History     | 60000\n45565  | Katz        | Comp. Sci.  | 75000\n98345  | Kim         | Elec. Eng.  | 80000",
      bullets: ["Schema: instructor(ID, name, dept_name, salary)", "Each row is one instructor; each column an attribute", "The current rows are an instance of this schema", "Values follow the style of the DSC university examples"] },

    // ---------------- Session 2 ----------------
    { t: "session", n: 2, title: "Database languages, database design, the database engine, database and application architecture", reading: "DSC Ch. 1, §1.4–1.7, pp. 13–23 · Self-study: §1.8–1.9, pp. 24–28" },
    { t: "twocol", title: "1.4 Database languages: DDL and DML", left: { head: "Data-definition language (DDL)", items: [
      "Specifies the database schema and additional properties of the data",
      "Defines consistency constraints: domain constraints, referential integrity, authorization",
      "The DDL output is stored in the data dictionary (metadata: data about data)",
    ] }, right: { head: "Data-manipulation language (DML)", items: [
      "Retrieval, insertion, deletion and modification of data",
      { b: "Procedural DML:", t: "the user specifies what data are needed and how to get them" },
      { b: "Declarative (nonprocedural) DML:", t: "the user specifies only what data are needed" },
      "A query language is the part of a DML that retrieves information",
    ] } },
    { t: "code", title: "SQL as DDL and DML", side: "Observe", code:
"-- DDL: define a relation schema\ncreate table department\n  (dept_name  varchar(20),\n   building   varchar(15),\n   budget     numeric(12,2),\n   primary key (dept_name));\n\n-- DML: a declarative query\nselect instructor.name\nfrom   instructor\nwhere  instructor.dept_name = 'History';",
      bullets: ["SQL is declarative: the query states what is wanted, not how to find it", "The primary-key clause is a constraint the DBMS enforces", "Applications send SQL through APIs such as ODBC and JDBC (more in Chapter 4, §5.1)"] },
    { t: "cards", title: "1.5 Database design", items: [
      { head: "Requirements", body: "Characterize the data needs of the prospective users." },
      { head: "Conceptual design", body: "Choose a data model and translate requirements into a conceptual schema (e.g. an E-R diagram)." },
      { head: "Logical design", body: "Map the conceptual schema to the implementation data model (relational schemas)." },
      { head: "Physical design", body: "Specify the physical features: file organization and internal storage structures." },
    ], notes: "Chapters 6 and 7 of the course cover conceptual and logical design; Chapter 8 touches physical design (indexes, file organization)." },
    { t: "twocol", title: "1.6 The database engine", left: { head: "Storage manager", items: [
      "Interface between low-level data and application programs and queries",
      "Components: authorization and integrity manager, transaction manager, file manager, buffer manager",
      "Implements data files, the data dictionary and indices",
    ] }, right: { head: "Query processor and transaction management", items: [
      "DDL interpreter, DML compiler (with query optimization) and query evaluation engine",
      "Transactions: a collection of operations that is a single logical unit of work",
      "Atomicity, consistency, isolation and durability (studied in Chapter 10)",
    ] } },
    { t: "cards", title: "1.7 Database and application architecture", items: [
      { head: "Centralized and client–server", body: "A single server machine runs the database; clients send requests." },
      { head: "Parallel and distributed", body: "Many machines in one data center, or geographically spread sites." },
      { head: "Two-tier", body: "The application on the client talks to the database directly (e.g. through ODBC/JDBC)." },
      { head: "Three-tier", body: "The client talks to an application server, which talks to the database; typical for web applications." },
    ] },
    { t: "bullets", title: "Self-study for this session", bullets: [
      { b: "§1.8 Database users and administrators:", t: "naive users, application programmers, sophisticated users; the database administrator (DBA) and their functions" },
      { b: "§1.9 History of database systems:", t: "from punched cards and tapes, through hierarchical and network models, to Codd's relational model and today's big-data and cloud systems" },
      "Assessed in Progress test 1 and the final exam",
    ], card: { head: "Reading tip", body: "While reading §1.9, note which problem each generation of systems tried to solve. This prepares CQ1.2." } },

    // ---------------- Session 3 ----------------
    { t: "session", n: 3, title: "Discussion of constructivist questions CQ1.1–CQ1.3; tool set-up (not graded)", reading: "DSC Appendix A, pp. 1287–1298 (university schema)" },
    { t: "cq", code: "CQ1.1", question: "Codd separated the logical view of data from its physical storage. What would be lost if applications had to know how and where each record is stored?",
      prompts: ["What changes in a program when a file is reorganized or an index is added?", "Connect your answer to physical data independence (§1.3)", "Give one concrete example from the university database"],
      where: ["DSC §1.3 (data abstraction, instances and schemas)", "DSC §1.9 (history)"] },
    { t: "cq", code: "CQ1.2", question: "Why do new data models (XML, document, graph, vector) keep appearing, and why do many of them end up adding SQL-like features?",
      prompts: ["Which problem did each new model try to solve?", "What do users eventually ask for: declarative queries, constraints, transactions?", "Is a new model a replacement or an extension?"],
      where: ["DSC §1.3 (data models)", "DSC §1.9 (history of database systems)"] },
    { t: "cq", code: "CQ1.3", question: "When is a database system NOT the right tool? Give a concrete example and justify it.",
      prompts: ["Think of the costs of a DBMS: set-up, administration, overhead", "Which of the file-processing problems of §1.2 does your example not have?", "Justify with the characteristics of the data and the users"],
      where: ["DSC §1.2 (purpose of database systems)", "DSC §1.6 (database engine)"] },
    { t: "bullets", title: "Answering a constructivist question", bullets: [
      "Choose ONE of CQ1.1–CQ1.3 and submit a short written answer on the LMS within one week",
      "A good answer states a claim, justifies it with the textbook and gives one concrete example",
      "Answers are graded on reasoning, use of the textbook and clarity",
      "All constructivist-question answers together count for 4% of the course grade",
    ], card: { head: "Tip", body: "Quote the section you rely on (for example, DSC §1.3) and explain it in your own words." } },
    { t: "cards", title: "Tool set-up (not graded)", items: [
      { head: "Install", body: ["Microsoft SQL Server (Developer or Express edition)", "SQL Server Management Studio (SSMS)"] },
      { head: "Load the sample database", body: ["Run the provided script to create the university database of DSC Appendix A", "Check that the tables department, instructor, student, course, section, takes, teaches exist"] },
      { head: "Check it works", body: ["Run: select * from department;", "Run: select name from instructor where dept_name = 'Physics';"] },
    ] },
    { t: "summary", points: [
      "A DBMS manages interrelated data and the programs that access them, solving the problems of file-processing systems",
      "Data models describe data; the relational model is the focus of this course",
      "Three levels of abstraction give physical data independence",
      "DDL defines schemas and constraints; DML (SQL) queries and modifies data",
      "The database engine = storage manager + query processor + transaction management",
    ], next: [
      "Submit one CQ1 answer within one week",
      "Finish the tool set-up",
      "Read DSC Ch. 2, §2.1–2.4, pp. 37–46 for session 4",
    ] },
  ],
};

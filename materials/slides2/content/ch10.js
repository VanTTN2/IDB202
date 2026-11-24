// Chapter 10 – Transactions, concurrency control and recovery
// Syllabus (24 Nov 2026): sessions 49, 50, 51 (DSC Ch. 17), 53 (guided exercises + Ch. 18 self-study),
// 55 (CQ10 + Ch. 18–19 self-study). DSC Ch. 18–19 are self-study (no lecture). PT2 is in session 56.
const L = require("../lib");
const { HEX, SZ, X0, CW } = L;

module.exports = function build(deck) {
  const src = (sec) => `Source: DSC 7th ed., ${sec}`;
  const ss = (sec) => `Self-study source: DSC 7th ed., ${sec}`;

  // ---------------- front matter ----------------
  L.section(deck, "Chapter 10");
  L.cover(deck, {
    course: "IDB201 – Introduction to Databases",
    chapter: "Chapter 10",
    title: "Transactions, concurrency control and recovery",
    sessions: "Sessions 49, 50, 51, 53 and 55",
    textbook: "Main textbook: Silberschatz, Korth and Sudarshan, Database System Concepts, 7th ed., McGraw-Hill, 2020 (DSC).\n" +
      "Taught: DSC Ch. 17, §17.1–17.10. Self-study: DSC Ch. 18, §18.1–18.2, §18.4, §18.8; Ch. 19, §19.1, §19.3–19.4.",
  });

  let s = L.content(deck, "Chapter 10 roadmap", "Schedule of the IDB201 syllabus, sessions 49–56");
  const rm = [
    ["49", "Transactions", "17.1–17.4 concept, model, storage, states; 17.10 transactions in SQL"],
    ["50", "Serializability", "17.5 isolation; 17.6 conflict serializability, precedence graphs"],
    ["51", "Recoverability and isolation levels", "17.7–17.9; set the self-study of Chapter 18"],
    ["53", "Guided exercises", "Exercises on Chapter 17; questions on the Chapter 18 self-study"],
    ["55", "Discussion and self-study check", "CQ10.1–CQ10.3; questions on the Chapter 18–19 self-study"],
  ];
  rm.forEach((r, i) => {
    const y = 1.45 + i * 0.98;
    s.addShape("roundRect", { x: X0, y, w: 1.5, h: 0.82, fill: { color: HEX.navy }, line: { color: HEX.navy }, rectRadius: 0.08 });
    L.text(s, "Session " + r[0], X0, y, 1.5, 0.82, { fontSize: 20, bold: true, color: HEX.white, align: "center", valign: "middle" });
    L.text(s, r[1], X0 + 1.75, y, 4.1, 0.82, { bold: true, color: HEX.navy, valign: "middle" });
    L.text(s, r[2], X0 + 5.9, y, 6.2, 0.82, { valign: "middle", fontSize: 22 });
  });
  L.text(s, "Session 52: project milestone 2 · Session 54: Lab 5 part 2 · Session 56: Progress test 2", X0, 6.35, CW, 0.45, { fontSize: SZ.caption, color: HEX.orange, bold: true });

  s = L.content(deck, "Learning objectives", "Course learning outcome CLO7 of the IDB201 syllabus");
  L.text(s, "After this chapter, you should be able to:", X0, 1.4, CW, 0.5, { italic: true, color: HEX.grey });
  L.bullets(s, [
    "State the ACID properties and the states of a transaction",
    "Test a schedule for conflict serializability with a precedence graph",
    "Decide whether a schedule is recoverable and cascadeless",
    "Relate the SQL isolation levels to their anomalies, and observe them in SQL Server",
    "Explain two-phase locking, deadlocks and wait-for graphs (self-study)",
    "Explain why write-ahead logging makes recovery possible (self-study)",
  ], X0, 1.95, CW, 3.9, { gap: 6 });
  L.card(s, X0, 5.55, CW, 1.15, null, "CLO7: analyze concurrent executions for conflict serializability and recoverability, and justify concurrency-control and recovery mechanisms.", { size: 20 });

  s = L.content(deck, "Self-study plan: DSC Chapters 18 and 19", "IDB201 syllabus, Schedule sessions 51, 53, 55 and Grading structure");
  L.table(s, [
    ["Read (required)", "Pages", "In session"],
    ["§18.1 Lock-based protocols, two-phase locking", "835–848", "53, 55"],
    ["§18.2 Deadlock handling", "849–852", "53"],
    ["§18.4 Insert, delete and predicate reads (phantoms)", "857–860", "53"],
    ["§18.8 Snapshot isolation", "872–879", "53"],
    ["§19.1 Failure classification", "907", "55"],
    ["§19.3 Recovery and atomicity (write-ahead logging)", "912–921", "55"],
    ["§19.4 Recovery algorithm", "922–925", "55"],
  ], X0, 1.4, CW, { colW: [7.6, 1.8, 2.73], rowH: 0.5 });
  L.text(s, "No lecture: read, then bring questions. Assessed in PT2 (session 56) and the final exam.", X0, 5.85, CW, 0.5, { fontSize: 20, bold: true, color: HEX.orange });
  L.text(s, "Optional: §18.3, §18.5, §18.7, §18.9; §19.2, §19.5–19.6", X0, 6.35, CW, 0.45, { fontSize: SZ.caption, color: HEX.grey });

  // ---------------- Session 49 ----------------
  L.section(deck, "Session 49");
  L.divider(deck, { label: "Session 49", title: "Transaction concept, a simple transaction model, storage structure, atomicity and durability; transactions as SQL statements",
    read: "Read before class: DSC Ch. 17, §17.1–17.4, pp. 799–806; §17.10" });

  s = L.content(deck, "17.1 What is a transaction?", src("§17.1"));
  L.bullets(s, [
    "A transaction is a unit of program execution that accesses and possibly updates data items",
    "It is started and ended by the application: begin … commit or rollback",
    "The DBMS must keep the database correct despite concurrent transactions and failures",
  ], X0, 1.45, 6.0, 4.9);
  // diagram: transfer between two accounts of givenDB (table account)
  L.node(s, "account 1 (An)\nbalance 500", 7.1, 1.7, 2.5, 1.2);
  L.node(s, "account 2 (Binh)\nbalance 300", 10.2, 1.7, 2.5, 1.2);
  L.arrow(s, 9.6, 2.3, 10.2, 2.3, { label: "transfer 50", ly: 1.3, lx: 8.6, lw: 2.6 });
  L.node(s, "account 1: 450", 7.1, 3.6, 2.5, 0.75, { fill: HEX.pale, size: 20 });
  L.node(s, "account 2: 350", 10.2, 3.6, 2.5, 0.75, { fill: HEX.pale, size: 20 });
  L.arrow(s, 8.35, 2.9, 8.35, 3.6); L.arrow(s, 11.45, 2.9, 11.45, 3.6);
  L.text(s, "Before and after: the total stays 800", 7.1, 4.6, 5.6, 0.5, { fontSize: 20, color: HEX.green, bold: true, align: "center" });
  L.text(s, "Data from givenDB, table account (lab5_large.sql)", 7.1, 5.15, 5.6, 0.45, { fontSize: SZ.caption, color: HEX.grey, align: "center" });

  s = L.content(deck, "17.1 The ACID properties", src("§17.1"));
  [["Atomicity", "All operations of the transaction are reflected in the database, or none are"],
   ["Consistency", "Run alone, a transaction keeps the database consistent"],
   ["Isolation", "Each transaction is unaware of the others that run concurrently"],
   ["Durability", "After a successful commit, the changes persist even if the system fails"]].forEach((c, i) => {
    L.card(s, X0 + (i % 2) * 6.15, 1.45 + Math.floor(i / 2) * 2.6, 5.9, 2.4, c[0], c[1], { num: i + 1 });
  });

  s = L.content(deck, "17.2 A simple transaction model", src("§17.2"));
  L.code(s, "-- Ti transfers 50 from A to B\nTi: read(A);\n    A := A - 50;\n    write(A);\n    read(B);\n    B := B + 50;\n    write(B).", X0, 1.45, 5.4, 3.6);
  L.bullets(s, [
    "read(X) copies X from the database into a local buffer of Ti",
    "write(X) copies the local value back to the database",
    "Consistency requirement: A + B is the same before and after Ti",
  ], 6.4, 1.45, 6.3, 4.8);

  s = L.content(deck, "What ACID requires of the transfer", src("§17.2"));
  L.card(s, X0, 1.45, 3.9, 4.9, "Atomicity", "A failure after write(A) but before write(B) must not leave A debited and B not credited.", { num: 1 });
  L.card(s, X0 + 4.1, 1.45, 3.9, 4.9, "Durability", "Once the user is told the transfer is done, it must survive a crash.", { num: 2 });
  L.card(s, X0 + 8.2, 1.45, 3.9, 4.9, "Isolation", "Another transaction must not see A already debited but B not yet credited.", { num: 3 });

  s = L.content(deck, "17.3 Storage structure", src("§17.3"));
  [["Volatile storage", "main memory, cache", "lost in a system crash", "FFFFFF"],
   ["Non-volatile storage", "disk, flash", "survives a crash; can still fail", HEX.pale],
   ["Stable storage", "several non-volatile copies", "never lost (an idealization); the log is kept here", HEX.paleOrange]].forEach((r, i) => {
    const y = 1.5 + i * 1.65;
    L.node(s, r[0], X0, y, 3.6, 1.35, { fill: r[3] });
    L.text(s, r[1], X0 + 3.9, y, 3.6, 1.35, { valign: "middle" });
    L.text(s, r[2], X0 + 7.6, y, 4.5, 1.35, { valign: "middle", color: i === 2 ? HEX.orange : HEX.ink, bold: i === 2 });
  });

  s = L.content(deck, "17.4 States of a transaction", "Diagram drawn for IDB201 after DSC 7th ed., §17.4");
  L.node(s, "active", 0.8, 3.05, 2.2, 0.95);
  L.node(s, "partially committed", 4.3, 1.55, 3.2, 0.95);
  L.node(s, "committed", 9.3, 1.55, 2.8, 0.95, { fill: "E3F1E8", lineColor: HEX.green, color: HEX.green });
  L.node(s, "failed", 4.3, 4.6, 3.2, 0.95, { fill: "FBE9E7", lineColor: HEX.red, color: HEX.red });
  L.node(s, "aborted", 9.3, 4.6, 2.8, 0.95, { fill: "FBE9E7", lineColor: HEX.red, color: HEX.red });
  L.arrow(s, 3.0, 3.25, 4.3, 2.2, { label: "last statement", lx: 1.6, ly: 2.25, lw: 2.6, lalign: "left" });
  L.arrow(s, 7.5, 2.0, 9.3, 2.0, { label: "output written", lx: 7.2, ly: 1.1, lw: 2.4 });
  L.arrow(s, 3.0, 3.8, 4.3, 4.9, { label: "error", lx: 2.4, ly: 4.55, lw: 1.5, lalign: "left" });
  L.arrow(s, 5.9, 2.5, 5.9, 4.6, { label: "failure", lx: 6.05, ly: 3.4, lw: 1.6, lalign: "left" });
  L.arrow(s, 7.5, 5.05, 9.3, 5.05, { label: "rolled back", lx: 7.2, ly: 5.55, lw: 2.4 });

  s = L.content(deck, "17.4 Atomicity and durability in practice", src("§17.4"));
  L.bullets(s, [
    "A transaction is committed only after its last output is safely recorded",
    "After an abort, the system can restart the transaction (if the cause was not its own logic) or kill it",
    "Observable external writes, such as printing a ticket or sending an e-mail, are delayed until commit",
    "The recovery system (Chapter 19, self-study) provides atomicity and durability",
  ], X0, 1.45, 7.2, 5.2);
  L.card(s, 8.3, 1.45, 4.4, 4.4, "Think about it", "An ATM gives out cash, then the system crashes before commit. Why do banks treat cash output as an external write?", { fill: HEX.paleOrange });

  s = L.content(deck, "17.10 Transactions as SQL statements", src("§17.10; SQL Server T-SQL reference (BEGIN TRANSACTION)"));
  L.code(s, "-- SQL Server, database University\n-- (table account: lab5_large.sql)\nbegin transaction;\n  update account\n     set balance = balance - 50\n   where id = 1;\n  update account\n     set balance = balance + 50\n   where id = 2;\ncommit transaction;\n-- or: rollback transaction;", X0, 1.45, 6.4, 5.3);
  L.bullets(s, [
    "Standard SQL: commit work / rollback work",
    "Without begin transaction, SQL Server commits each statement on its own (autocommit)",
    "Both updates become visible together, or not at all",
  ], 7.3, 1.45, 5.4, 5.2);

  s = L.content(deck, "17.10 Transaction boundaries and predicates", src("§17.10"));
  L.card(s, X0, 1.45, 5.9, 2.4, "Group statements", "A transaction makes several statements one atomic unit; keep it short to reduce waiting.", { num: 1 });
  L.card(s, X0 + 6.15, 1.45, 5.9, 2.4, "Errors", "Inside procedures, use TRY…CATCH and roll back on error (Chapter 5).", { num: 2 });
  L.card(s, X0, 4.05, 5.9, 2.5, "Predicate reads", "A where clause reads a set defined by a condition; new rows can enter that set (phantoms, §18.4).", { num: 3 });
  L.card(s, X0 + 6.15, 4.05, 5.9, 2.5, "Lab 5 part 2", "You will run two sessions in SSMS and watch these effects (session 54).", { num: 4 });

  s = L.content(deck, "Quick check: session 49", "Questions written for IDB201 on DSC 7th ed., §17.1–17.4",
    "Answers: 1 atomicity (recovery system undoes the debit); 2 stable storage; 3 partially committed.");
  [["A crash leaves account 1 debited but account 2 not credited. Which ACID property is violated?"],
   ["On which kind of storage must the log be kept?"],
   ["A transaction has executed its last statement but has not committed yet. What is its state?"]].forEach((q, i) => {
    L.card(s, X0, 1.45 + i * 1.7, CW, 1.5, null, `${i + 1}.  ${q[0]}`, { fill: i % 2 ? HEX.pale : HEX.paleOrange });
  });

  // ---------------- Session 50 ----------------
  L.section(deck, "Session 50");
  L.divider(deck, { label: "Session 50", title: "Transaction isolation; serializability: conflict serializability and precedence graphs",
    read: "Read before class: DSC Ch. 17, §17.5–17.6, pp. 807–818" });

  s = L.content(deck, "17.5 Why run transactions concurrently?", src("§17.5"));
  [["Throughput", "One transaction uses the CPU while another waits for the disk"],
   ["Utilization", "Processor and disks spend less time idle"],
   ["Waiting time", "Short transactions need not wait behind long ones"]].forEach((c, i) => {
    L.card(s, X0 + i * 4.1, 1.45, 3.9, 3.3, c[0], c[1], { num: i + 1 });
  });
  s.addShape("roundRect", { x: X0, y: 5.0, w: CW, h: 1.6, fill: { color: HEX.navy }, line: { color: HEX.navy }, rectRadius: 0.08 });
  L.text(s, "The price: interleaved operations can leave the database inconsistent. The concurrency-control component must allow only safe schedules.", X0 + 0.3, 5.0, CW - 0.6, 1.6, { color: HEX.white, bold: true, valign: "middle" });

  s = L.content(deck, "17.5 Schedules", src("§17.5"));
  L.bullets(s, [
    "A schedule lists the instructions of a set of transactions in time order",
    "It keeps the order of the instructions inside each transaction",
    "Serial schedule: one transaction after another; correct if each transaction is",
  ], X0, 1.45, 4.9, 5.1);
  L.text(s, "Serial", 5.7, 1.45, 3.4, 0.45, { bold: true, color: HEX.navy, align: "center" });
  L.text(s, "Concurrent", 9.3, 1.45, 3.4, 0.45, { bold: true, color: HEX.navy, align: "center" });
  L.table(s, [["T1", "T2"], ["read(A)", ""], ["write(A)", ""], ["", "read(A)"], ["", "write(A)"]], 5.7, 2.0, 3.4, { mono: true, size: 20, rowH: 0.7, colW: [1.7, 1.7] });
  L.table(s, [["T1", "T2"], ["read(A)", ""], ["", "read(A)"], ["write(A)", ""], ["", "write(A)"]], 9.3, 2.0, 3.4, { mono: true, size: 20, rowH: 0.7, colW: [1.7, 1.7] });
  L.text(s, "Time goes down", 5.7, 5.7, 7.0, 0.45, { fontSize: SZ.caption, color: HEX.grey, align: "center" });

  s = L.content(deck, "A lost update on account 1", "Example written for IDB201 on givenDB (account 1, balance 500); anomaly of DSC 7th ed., §17.5");
  L.table(s, [["Time", "T1 (withdraw 100)", "T2 (deposit 50)", "balance in DB"],
    ["1", "read(balance) = 500", "", "500"], ["2", "", "read(balance) = 500", "500"],
    ["3", "write(400)", "", "400"], ["4", "", "write(550)", "550"]], X0, 1.45, CW, { colW: [1.3, 3.9, 3.9, 3.03], rowH: 0.62 });
  L.card(s, X0, 4.85, 5.9, 1.75, "Result", "The correct balance is 450. T1's update is lost.", { fill: "FBE9E7", headColor: HEX.red });
  L.card(s, X0 + 6.15, 4.85, 5.95, 1.75, "Rule", "No serial order gives 550: this schedule must not be allowed.", {});

  s = L.content(deck, "17.6 Conflicting instructions", src("§17.6"));
  L.text(s, "Two instructions of different transactions on the same item Q conflict if at least one of them is write(Q).", X0, 1.45, CW, 0.9);
  L.table(s, [["", "Tj: read(Q)", "Tj: write(Q)"],
    [{ text: "Ti: read(Q)", options: { bold: true } }, { text: "no conflict", options: { color: HEX.green } }, { text: "conflict", options: { color: HEX.red, bold: true } }],
    [{ text: "Ti: write(Q)", options: { bold: true } }, { text: "conflict", options: { color: HEX.red, bold: true } }, { text: "conflict", options: { color: HEX.red, bold: true } }]],
    X0, 2.6, 7.5, { colW: [2.5, 2.5, 2.5], rowH: 0.8, size: 24 });
  L.card(s, 8.6, 2.6, 4.1, 2.4, "Why it matters", "The order of two conflicting instructions changes the result; the order of two reads does not.", { size: 20 });
  L.card(s, X0, 5.25, CW, 1.35, null, "Example: r1(balance) and w2(balance) conflict. If T2 writes first, T1 reads a different value.", { fill: HEX.paleOrange });

  s = L.content(deck, "17.6 Conflict equivalence", src("§17.6"));
  L.bullets(s, [
    "Swapping two adjacent non-conflicting instructions gives a conflict-equivalent schedule",
    "A schedule is conflict serializable if it is conflict equivalent to some serial schedule",
  ], X0, 1.45, 5.4, 4.8);
  L.code(s, "S : r1(A) w1(A) r2(A) r1(B)\n\nswap r2(A) and r1(B)\n(different items)\n\nS': r1(A) w1(A) r1(B) r2(A)\n\n=> T1, then T2 (serial)", 6.3, 1.45, 6.4, 4.2, { size: 20 });
  L.text(s, "Each swap keeps the order of every conflicting pair.", 6.3, 5.85, 6.4, 0.7, { fontSize: 20, color: HEX.grey });

  s = L.content(deck, "17.6 Conflict and view serializability", src("§17.6"));
  L.card(s, X0, 1.45, 5.9, 4.9, "Conflict serializable", ["Tested with a precedence graph", "Used by real systems", "Every conflict-serializable schedule is view serializable"], { fill: "E3F1E8", headColor: HEX.green });
  L.card(s, X0 + 6.15, 1.45, 5.9, 4.9, "View serializable", ["A weaker (larger) class", "Testing it is computationally expensive", "Not used in practice"], {});

  s = L.content(deck, "17.6 Building a precedence graph", src("§17.6"));
  [["Vertices", "One vertex for each transaction of the schedule"],
   ["Edges", "Ti → Tj if an instruction of Ti conflicts with a later instruction of Tj"],
   ["Test", "Cycle: not conflict serializable. No cycle: serializable, in a topological order"]].forEach((c, i) => {
    L.card(s, X0 + i * 4.1, 1.45, 3.9, 4.6, c[0], c[1], { num: i + 1 });
    if (i < 2) L.arrow(s, X0 + i * 4.1 + 3.9, 3.75, X0 + (i + 1) * 4.1, 3.75, { color: HEX.orange });
  });

  s = L.content(deck, "Example: the lost update has a cycle", "Example written for IDB201; test of DSC 7th ed., §17.6");
  L.code(s, "T1: read(A)\nT2: read(A)\nT1: write(A)\nT2: write(A)", X0, 1.5, 4.5, 2.6);
  L.node(s, "T1", 6.6, 2.4, 1.4, 1.0, { shape: "ellipse" });
  L.node(s, "T2", 10.6, 2.4, 1.4, 1.0, { shape: "ellipse" });
  L.arrow(s, 8.0, 2.65, 10.6, 2.65, { label: "r1(A) before w2(A)", ly: 1.95, lx: 7.8, lw: 3.0 });
  L.arrow(s, 10.6, 3.15, 8.0, 3.15, { label: "r2(A) before w1(A)", ly: 3.35, lx: 7.8, lw: 3.0 });
  L.text(s, "Cycle T1 → T2 → T1: the schedule is not conflict serializable.", X0, 4.7, CW, 0.8, { bold: true, color: HEX.red });

  s = L.content(deck, "Example: three transactions", "Example written for IDB201 (final practice set); test of DSC 7th ed., §17.6");
  L.code(s, "S = r1(X) r2(Y) w2(X) r3(X) w1(Y)", X0, 1.45, 7.2, 0.75);
  L.node(s, "T1", 1.2, 3.6, 1.3, 0.95, { shape: "ellipse" });
  L.node(s, "T2", 5.4, 2.6, 1.3, 0.95, { shape: "ellipse" });
  L.node(s, "T3", 5.4, 5.2, 1.3, 0.95, { shape: "ellipse" });
  L.arrow(s, 2.5, 3.85, 5.4, 2.9, { label: "X: r1 before w2", lx: 1.4, ly: 2.75, lw: 3.0 });
  L.arrow(s, 5.4, 3.3, 2.5, 4.2, { label: "Y: r2 before w1", lx: 3.0, ly: 4.25, lw: 2.6 });
  L.arrow(s, 6.05, 3.55, 6.05, 5.2, { label: "X: w2 before r3", lx: 6.25, ly: 4.15, lw: 2.7, lalign: "left" });
  L.card(s, 8.6, 2.4, 4.1, 3.6, "Conclusion", "Cycle T1 → T2 → T1: not conflict serializable. Without w1(Y) the order T1, T2, T3 works.", { size: 22 });

  s = L.content(deck, "From an acyclic graph to a serial order", "Example written for IDB201; topological sorting as in DSC 7th ed., §17.6");
  L.code(s, "S = r2(B) w1(B) r1(A) w3(A)", X0, 1.45, 6.5, 0.75);
  L.node(s, "T2", 0.9, 3.2, 1.3, 0.95, { shape: "ellipse" });
  L.node(s, "T1", 3.7, 3.2, 1.3, 0.95, { shape: "ellipse" });
  L.node(s, "T3", 6.5, 3.2, 1.3, 0.95, { shape: "ellipse" });
  L.arrow(s, 2.2, 3.67, 3.7, 3.67, { label: "B", ly: 2.75, lx: 2.45, lw: 1.0 });
  L.arrow(s, 5.0, 3.67, 6.5, 3.67, { label: "A", ly: 2.75, lx: 5.25, lw: 1.0 });
  L.card(s, 8.6, 2.2, 4.1, 3.4, "Serial order", "No cycle. Topological order T2, T1, T3 is an equivalent serial schedule.", { fill: "E3F1E8", headColor: HEX.green, size: 22 });
  L.text(s, "Lab 5 part 2 asks you to draw these graphs for schedules you observe in SQL Server.", X0, 5.4, 7.6, 0.9, { fontSize: 20, color: HEX.grey });

  s = L.content(deck, "Quick check: session 50", "Questions written for IDB201 on DSC 7th ed., §17.6",
    "Answers: 1 no, two reads never conflict; 2 yes, both edges go T1 -> T2, serial order T1, T2; 3 not serializable, cycle T1 -> T2 -> T3 -> T1.");
  ["Do r1(A) and r2(A) conflict?",
   "Is r1(A) w1(A) r2(A) w2(A) r1(B) w1(B) r2(B) w2(B) conflict serializable? In which order?",
   "A precedence graph has the edges T1 → T2, T2 → T3 and T3 → T1. What do you conclude?"].forEach((q, i) => {
    L.card(s, X0, 1.45 + i * 1.7, CW, 1.5, null, `${i + 1}.  ${q}`, { fill: i % 2 ? HEX.pale : HEX.paleOrange });
  });

  // ---------------- Session 51 ----------------
  L.section(deck, "Session 51");
  L.divider(deck, { label: "Session 51", title: "Recoverable and cascadeless schedules; transaction isolation levels and their implementation",
    read: "Read before class: DSC Ch. 17, §17.7–17.9, pp. 819–827\nSelf-study set today (required): DSC Ch. 18, §18.1, pp. 835–848; §18.2, pp. 849–852; §18.4, pp. 857–860" });

  s = L.content(deck, "17.7 Recoverable schedules", src("§17.7"));
  L.text(s, "If Tj reads a data item written by Ti, then Ti must commit before Tj commits.", X0, 1.45, CW, 0.9, { bold: true, color: HEX.navy });
  L.table(s, [["T1", "T2"], ["write(A)", ""], ["", "read(A)"], ["", "commit"], ["abort", ""]], X0, 2.5, 5.0, { mono: true, size: 20, rowH: 0.55 });
  L.card(s, 6.2, 2.5, 6.5, 3.2, "Not recoverable", "T2 has committed a value of A that T1 never committed. When T1 aborts, T2 cannot be undone.", { fill: "FBE9E7", headColor: HEX.red });

  s = L.content(deck, "17.7 Cascading rollback", src("§17.7"));
  L.table(s, [["T1", "T2", "T3"], ["write(A)", "", ""], ["", "read(A); write(B)", ""], ["", "", "read(B)"], ["abort", "", ""]], X0, 1.5, 7.2, { mono: true, size: 20, rowH: 0.55, colW: [2.0, 3.0, 2.2] });
  L.node(s, "T1 aborts", 8.3, 1.5, 2.6, 0.8, { fill: "FBE9E7", lineColor: HEX.red, color: HEX.red });
  L.node(s, "T2 rolled back", 8.3, 3.0, 2.6, 0.8);
  L.node(s, "T3 rolled back", 8.3, 4.5, 2.6, 0.8);
  L.arrow(s, 9.6, 2.3, 9.6, 3.0); L.arrow(s, 9.6, 3.8, 9.6, 4.5);
  L.text(s, "One abort forces others: much work is undone.", X0, 4.6, 7.2, 1.0, { bold: true, color: HEX.red });

  s = L.content(deck, "17.7 Cascadeless schedules", "Diagram drawn for IDB201 after DSC 7th ed., §17.7");
  L.text(s, "If Tj reads a data item written by Ti, then Ti commits before Tj reads it.", X0, 1.45, 5.6, 1.4, { bold: true, color: HEX.navy });
  L.bullets(s, ["No cascading rollback is possible", "Every cascadeless schedule is recoverable"], X0, 3.1, 5.6, 2.5);
  s.addShape("roundRect", { x: 6.5, y: 1.45, w: 6.2, h: 5.1, fill: { color: HEX.pale }, line: { color: HEX.line }, rectRadius: 0.1 });
  L.text(s, "All schedules", 6.7, 1.55, 5.8, 0.45, { fontSize: SZ.label, bold: true, color: HEX.grey });
  s.addShape("roundRect", { x: 7.0, y: 2.1, w: 5.2, h: 4.2, fill: { color: "DCE6F1" }, line: { color: HEX.navy }, rectRadius: 0.1 });
  L.text(s, "Recoverable", 7.2, 2.2, 4.8, 0.45, { fontSize: SZ.label, bold: true, color: HEX.navy });
  s.addShape("roundRect", { x: 7.5, y: 2.75, w: 4.2, h: 3.3, fill: { color: "E3F1E8" }, line: { color: HEX.green }, rectRadius: 0.1 });
  L.text(s, "Cascadeless", 7.7, 2.85, 3.8, 0.45, { fontSize: SZ.label, bold: true, color: HEX.green });
  s.addShape("roundRect", { x: 8.1, y: 3.6, w: 3.0, h: 1.9, fill: { color: HEX.white }, line: { color: HEX.orange }, rectRadius: 0.1 });
  L.text(s, "Serial", 8.1, 3.6, 3.0, 1.9, { fontSize: 20, bold: true, color: HEX.orange, align: "center", valign: "middle" });

  s = L.content(deck, "Three anomalies of concurrent reads", src("§17.8"));
  [["Dirty read", "T2 reads a value that T1 has written but not committed; T1 may still abort"],
   ["Non-repeatable read", "T1 reads an item twice; T2 updates and commits it in between"],
   ["Phantom", "T1 reads a set by a condition twice; T2 inserts a row that matches it"]].forEach((c, i) => {
    L.card(s, X0 + i * 4.1, 1.45, 3.9, 4.9, c[0], c[1], { num: i + 1 });
  });

  s = L.content(deck, "17.8 Isolation levels in SQL", src("§17.8"));
  const no = { text: "not possible", options: { color: HEX.green } }, yes = { text: "possible", options: { color: HEX.red, bold: true } };
  L.table(s, [["Level", "Dirty read", "Non-repeatable read", "Phantom"],
    ["Read uncommitted", yes, yes, yes], ["Read committed", no, yes, yes], ["Repeatable read", no, no, yes], ["Serializable", no, no, no]],
    X0, 1.45, CW, { colW: [3.4, 2.7, 3.3, 2.73], rowH: 0.85 });
  L.text(s, "All levels forbid dirty writes. SQL Server's default level is read committed.", X0, 5.9, CW, 0.7, { color: HEX.navy, bold: true });

  s = L.content(deck, "Isolation levels in SQL Server", src("§17.8; SQL Server T-SQL reference (SET TRANSACTION ISOLATION LEVEL)"));
  L.code(s, "set transaction isolation level\n    repeatable read;\nbegin transaction;\n  select balance from account\n   where id = 3;\n  -- ... other work ...\n  select balance from account\n   where id = 3;  -- same value\ncommit;", X0, 1.45, 6.6, 5.2);
  L.bullets(s, [
    "The level applies to the session until it is changed",
    "Snapshot isolation must first be allowed for the database",
    "Lab 5 part 2 shows each anomaly with two sessions",
  ], 7.5, 1.45, 5.2, 5.2);

  s = L.content(deck, "17.9 How isolation levels are implemented", src("§17.9"));
  [["Locking", "Shared locks for reads, exclusive locks for writes; held longer at stricter levels"],
   ["Timestamps", "Each transaction gets a timestamp; conflicting operations run in timestamp order"],
   ["Multiple versions", "Readers see an older committed version; writers create new versions"]].forEach((c, i) => {
    L.card(s, X0 + i * 4.1, 1.45, 3.9, 4.9, c[0], c[1], { num: i + 1 });
  });

  s = L.content(deck, "Self-study for session 53: DSC Chapter 18", "IDB201 syllabus, session 51 (self-study) and session 54 (Lab 5 part 2)");
  L.table(s, [["Read", "Pages", "Answer before session 53"],
    ["§18.1 Two-phase locking", "835–848", "What is the lock point?"],
    ["§18.2 Deadlock handling", "849–852", "When does a wait-for graph show a deadlock?"],
    ["§18.4 Phantoms", "857–860", "Why are tuple locks not enough?"],
    ["§18.8 Snapshot isolation", "872–879", "What is write skew?"]], X0, 1.45, CW, { colW: [4.2, 1.8, 6.13], rowH: 0.8 });
  L.text(s, "These sections are not lectured. Bring your answers and questions to session 53; they are assessed in Progress test 2.", X0, 5.65, CW, 1.0, { color: HEX.orange, bold: true });

  s = L.content(deck, "Quick check: session 51", "Questions written for IDB201 on DSC 7th ed., §17.7–17.8",
    "Answers: 1 not recoverable, T2 commits before T1; 2 read committed; 3 phantom; serializable prevents it.");
  ["Schedule: w1(A) r2(A) commit2 commit1. Is it recoverable?",
   "Which level prevents dirty reads but allows non-repeatable reads?",
   "A count of Hanoi accounts changes between two reads in one transaction. Which anomaly is this, and which level prevents it?"].forEach((q, i) => {
    L.card(s, X0, 1.45 + i * 1.7, CW, 1.5, null, `${i + 1}.  ${q}`, { fill: i % 2 ? HEX.pale : HEX.paleOrange });
  });

  // ---------------- Session 53 ----------------
  L.section(deck, "Session 53");
  L.divider(deck, { label: "Session 53", title: "Guided exercises on Chapter 17; questions on the self-study of DSC Chapter 18 (preparation for Lab 5 part 2)",
    read: "Bring: answers to the self-study questions of session 51\nSelf-study: DSC §18.8, pp. 872–879; optional §18.3, §18.5, §18.7, §18.9" });

  s = L.content(deck, "Plan of session 53", "IDB201 syllabus, session 53; Chapter 10 exercise sheet");
  [["Exercise 1", "Precedence graph of a three-transaction schedule", "10 min"],
   ["Exercise 2", "Recoverable or cascadeless?", "8 min"],
   ["Exercise 3", "Choosing an isolation level", "7 min"],
   ["Self-study check", "Two-phase locking, deadlocks, phantoms, snapshot isolation", "15 min"],
   ["Lab 5 part 2", "Set-up for session 54", "5 min"]].forEach((r, i) => {
    const y = 1.45 + i * 1.05;
    L.node(s, r[0], X0, y, 2.9, 0.85, { size: 20, fill: i === 3 ? HEX.paleOrange : HEX.white });
    L.text(s, r[1], X0 + 3.2, y, 7.3, 0.85, { valign: "middle" });
    L.text(s, r[2], X0 + 10.5, y, 1.6, 0.85, { valign: "middle", color: HEX.grey, align: "right" });
  });

  s = L.content(deck, "Exercise 1: is S conflict serializable?", "Chapter 10 exercise sheet, question 1; test of DSC 7th ed., §17.6");
  L.code(s, "S = r1(A) r2(B) w2(A) r3(A) w3(B) w1(B)", X0, 1.45, 8.6, 0.75);
  L.bullets(s, ["List every conflicting pair (same item, at least one write)", "Draw the precedence graph", "Is there a cycle? If not, give a serial order"], X0, 2.5, 7.5, 3.5);
  L.card(s, 8.6, 2.5, 4.1, 3.2, "Hint", "Item A: r1, w2, r3. Item B: r2, w3, w1. Look at each item separately.", { fill: HEX.paleOrange, size: 22 });

  s = L.content(deck, "Exercise 1: solution", "Solution written for IDB201; test of DSC 7th ed., §17.6");
  L.node(s, "T1", 1.0, 1.9, 1.3, 0.95, { shape: "ellipse" });
  L.node(s, "T2", 5.6, 1.9, 1.3, 0.95, { shape: "ellipse" });
  L.node(s, "T3", 3.3, 4.9, 1.3, 0.95, { shape: "ellipse" });
  L.arrow(s, 2.3, 2.15, 5.6, 2.15, { label: "A: r1 < w2", ly: 1.35, lx: 2.45, lw: 3.0 });
  L.arrow(s, 5.6, 2.65, 2.3, 2.65, { label: "B: r2 < w1", ly: 2.75, lx: 2.45, lw: 3.0 });
  L.arrow(s, 6.0, 2.85, 4.4, 4.9, { label: "A: w2 < r3; B: r2 < w3", lx: 5.2, ly: 3.75, lw: 3.3, lalign: "left" });
  L.arrow(s, 3.5, 4.9, 1.8, 2.85, { label: "B: w3 < w1", lx: 0.6, ly: 3.75, lw: 2.2, lalign: "left" });
  L.card(s, 8.6, 1.9, 4.1, 3.9, "Answer", "Cycles T1 → T2 → T1 and T1 → T2 → T3 → T1: S is not conflict serializable.", { fill: "FBE9E7", headColor: HEX.red, size: 22 });

  s = L.content(deck, "Exercise 2: recoverable or cascadeless?", "Chapter 10 exercise sheet, question 3; DSC 7th ed., §17.7");
  L.table(s, [["Schedule", "Recoverable?", "Cascadeless?"],
    [{ text: "S1: w1(A) r2(A) c2 c1", options: { fontFace: L.CODE } }, "?", "?"],
    [{ text: "S2: w1(A) r2(A) c1 c2", options: { fontFace: L.CODE } }, "?", "?"],
    [{ text: "S3: w1(A) c1 r2(A) c2", options: { fontFace: L.CODE } }, "?", "?"]], X0, 1.45, CW, { colW: [6.13, 3.0, 3.0], rowH: 0.95 });
  L.text(s, "c1, c2: commit of T1, T2. Decide for each schedule and give the reason.", X0, 5.6, CW, 0.9, { color: HEX.grey });

  s = L.content(deck, "Exercise 2: solution", "Solution written for IDB201 on DSC 7th ed., §17.7");
  const N = (t) => ({ text: t, options: { color: HEX.red, bold: true } }), Y = (t) => ({ text: t, options: { color: HEX.green, bold: true } });
  L.table(s, [["Schedule", "Recoverable?", "Cascadeless?"],
    [{ text: "S1: w1(A) r2(A) c2 c1", options: { fontFace: L.CODE } }, N("no"), N("no")],
    [{ text: "S2: w1(A) r2(A) c1 c2", options: { fontFace: L.CODE } }, Y("yes"), N("no")],
    [{ text: "S3: w1(A) c1 r2(A) c2", options: { fontFace: L.CODE } }, Y("yes"), Y("yes")]], X0, 1.5, CW, { colW: [6.13, 3.0, 3.0], rowH: 0.75 });
  L.bullets(s, ["S1: T2 commits before T1, from which it read", "S2: T2 reads an uncommitted value, but commits after T1", "S3: T2 reads only committed data"], X0, 4.75, CW, 1.9, { size: 22 });

  s = L.content(deck, "Exercise 3: lowest safe isolation level", "Chapter 10 exercise sheet, question 5; DSC 7th ed., §17.8 and the account table of givenDB");
  [["a", "A report must never show a transfer that is later rolled back; new accounts do not matter."],
   ["b", "A transaction reads the balance of account 3 twice and must get the same value both times."],
   ["c", "A transaction counts the Hanoi accounts twice and must get the same count both times."]].forEach((q, i) => {
    L.card(s, X0, 1.45 + i * 1.7, CW, 1.5, null, `(${q[0]})  ${q[1]}`, { fill: i % 2 ? HEX.pale : HEX.paleOrange });
  });

  s = L.content(deck, "Exercise 3: solution", "Solution written for IDB201 on DSC 7th ed., §17.8");
  [["(a) Read committed", "Prevents dirty reads; the report may still change between reads"],
   ["(b) Repeatable read", "Rows already read cannot change until commit"],
   ["(c) Serializable", "Also prevents phantoms: a new Hanoi account must wait"]].forEach((c, i) => {
    L.card(s, X0 + i * 4.1, 1.45, 3.9, 4.6, c[0], c[1], { fill: i === 2 ? "E3F1E8" : HEX.pale });
  });

  s = L.content(deck, "Self-study check: 2PL (§18.1)", "Self-study; diagram drawn for IDB201 after DSC 7th ed., §18.1");
  L.bullets(s, [
    "Growing phase: obtain locks, release none",
    "Shrinking phase: release locks, obtain none",
    "Lock point: the moment of the last lock",
    "Strict 2PL holds exclusive locks until commit: cascadeless",
  ], X0, 1.45, 5.6, 5.1, { size: 22 });
  // lock-count step curve
  const bx = 6.6, by = 5.6;
  L.arrow(s, bx, by, 12.6, by, { color: HEX.grey }); L.arrow(s, bx, by, bx, 1.6, { color: HEX.grey });
  L.text(s, "time", 11.6, by + 0.05, 1.0, 0.4, { fontSize: SZ.label, color: HEX.grey });
  L.text(s, "locks held", bx + 0.1, 1.45, 2.0, 0.4, { fontSize: SZ.label, color: HEX.grey });
  const pts = [[0, 0], [0.6, 1], [1.4, 2], [2.4, 3], [3.4, 2], [4.2, 1], [5.0, 0], [5.6, 0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, l1] = pts[i], [x2, l2] = pts[i + 1];
    const col = x2 <= 2.4 ? HEX.navy : HEX.orange;
    s.addShape("line", { x: bx + x1, y: by - 1.1 * l1, w: x2 - x1, h: 0.001, line: { color: col, width: 4 } });
    if (l1 !== l2) s.addShape("line", { x: bx + x2, y: by - 1.1 * Math.max(l1, l2), w: 0.001, h: 1.1 * Math.abs(l2 - l1), line: { color: col, width: 4 } });
  }
  s.addShape("line", { x: bx + 2.4, y: 1.9, w: 0.001, h: by - 1.9, line: { color: HEX.red, width: 2, dashType: "dash" } });
  L.text(s, "lock point", bx + 2.5, 1.85, 2.0, 0.4, { fontSize: SZ.label, color: HEX.red, bold: true });
  L.text(s, "growing", bx + 0.15, by - 2.2, 1.8, 0.4, { fontSize: SZ.label, color: HEX.navy, bold: true });
  L.text(s, "shrinking", bx + 3.7, by - 0.5, 1.9, 0.4, { fontSize: SZ.label, color: HEX.orange, bold: true });

  s = L.content(deck, "Self-study check: deadlocks (§18.2)", "Self-study; example from Lab 5 part 2; wait-for graphs of DSC 7th ed., §18.2");
  L.node(s, "Session A\nholds X(account 1)", 0.8, 2.0, 3.6, 1.3);
  L.node(s, "Session B\nholds X(account 2)", 6.6, 2.0, 3.6, 1.3);
  L.arrow(s, 4.4, 2.35, 6.6, 2.35, { label: "A waits for account 2", ly: 1.45, lx: 3.6, lw: 3.8 });
  L.arrow(s, 6.6, 2.95, 4.4, 2.95, { label: "B waits for account 1", ly: 3.4, lx: 3.6, lw: 3.8 });
  L.bullets(s, [
    "A cycle in the wait-for graph means deadlock",
    "SQL Server rolls back one victim with error 1205",
    "Prevention: lock items in a fixed order",
  ], X0, 4.3, 9.6, 2.4, { size: 22 });
  L.card(s, 10.5, 2.0, 2.2, 2.8, "Ask", "Why does 2PL not prevent this?", { fill: HEX.paleOrange, size: 20 });

  s = L.content(deck, "Self-study check: phantoms, snapshots", "Self-study source: DSC 7th ed., §18.4 and §18.8; data from givenDB (instructor)");
  L.code(s, "-- T1 (serializable needed)\nselect count(*) from instructor\n where dept_name = 'Physics';  -- 2\n-- T2\ninsert into instructor values\n ('I3003','Feynman','Physics',94000);", X0, 1.45, 6.6, 3.2, { size: 18 });
  L.text(s, "T2 conflicts with T1 on a row T1 never read: locking the predicate (index-range locks) is needed.", X0, 4.85, 6.6, 1.6, { fontSize: 22 });
  L.card(s, 7.5, 1.45, 5.2, 5.0, "Snapshot isolation (§18.8)", [
    "Reads see the committed data at the start of the transaction",
    "First committer wins on the same item",
    "Not serializable: write skew is possible",
  ], { size: 22 });

  s = L.content(deck, "Preparing Lab 5 part 2 (session 54)", "IDB201 Lab 5 handout, part 2; DSC 7th ed., §17.8, §18.1–18.2, §18.4");
  L.node(s, "Query window A\n(session A)", 0.9, 1.5, 3.6, 1.2);
  L.node(s, "Query window B\n(session B)", 5.0, 1.5, 3.6, 1.2);
  [["1", "begin tran; update account …", 0.9], ["2", "select balance … (waits?)", 5.0], ["3", "rollback;", 0.9]].forEach((t, i) => {
    const y = 3.0 + i * 0.95;
    L.node(s, t[0], t[2], y, 0.6, 0.6, { shape: "ellipse", fill: HEX.orange, lineColor: HEX.orange, color: HEX.white, size: 20 });
    L.text(s, t[1], t[2] + 0.75, y, 3.6, 0.6, { fontFace: L.CODE, fontSize: 18, valign: "middle" });
  });
  L.arrow(s, 0.6, 3.0, 0.6, 5.6, { color: HEX.grey, label: "time", lx: 0.15, ly: 5.65, lw: 1.0 });
  L.card(s, 9.2, 1.5, 3.5, 5.1, "Before the lab", ["Run lab5_large.sql", "Open two windows on University", "Re-read §17.8"], { size: 22 });

  // ---------------- Session 55 ----------------
  L.section(deck, "Session 55");
  L.divider(deck, { label: "Session 55", title: "Discussion of the Chapter 10 constructivist questions; questions on the self-study of DSC Chapters 18–19",
    read: "Self-study before class: DSC Ch. 19, §19.1, p. 907; §19.3, pp. 912–921; §19.4, pp. 922–925\nOptional: §19.2, pp. 908–911; §19.5–19.6, pp. 926–930" });

  s = L.content(deck, "Plan of session 55", "IDB201 syllabus, session 55");
  [["CQ10.1–CQ10.3", "Discussion in groups, then whole class", "20 min"],
   ["Self-study check", "Failures, write-ahead logging, recovery", "15 min"],
   ["Practice", "Three exam-style exercises", "8 min"],
   ["Next", "Progress test 2 in session 56", "2 min"]].forEach((r, i) => {
    const y = 1.6 + i * 1.25;
    L.node(s, r[0], X0, y, 3.4, 0.9, { size: 20, fill: i === 1 ? HEX.paleOrange : HEX.white });
    L.text(s, r[1], X0 + 3.7, y, 6.8, 0.9, { valign: "middle" });
    L.text(s, r[2], X0 + 10.5, y, 1.6, 0.9, { valign: "middle", color: HEX.grey, align: "right" });
  });

  const cq = (title, q, prompts, look) => {
    const s2 = L.content(deck, title, look);
    L.card(s2, X0, 1.45, CW, 1.6, null, null, { fill: HEX.navy });
    s2.addText(q, { x: X0 + 0.3, y: 1.5, w: CW - 0.6, h: 1.5, fontSize: 26, color: HEX.white, italic: true, valign: "middle", isTextBox: true, margin: 0 });
    L.text(s2, "Discussion prompts", X0, 3.3, CW, 0.5, { bold: true, color: HEX.orange });
    L.bullets(s2, prompts, X0, 3.8, CW, 2.1, { gap: 4, size: 22 });
    L.card(s2, X0, 5.95, CW, 0.8, null, "Your answer: 150–200 words, using the textbook; submit on the LMS within one week.", { fill: HEX.paleOrange, size: 22 });
  };
  cq("Constructivist question CQ10.1", "Why is serializability the accepted correctness criterion for concurrent transactions? What weaker criteria do real systems use, and why?",
     ["What does a serial schedule guarantee if each transaction is correct?", "Which anomalies do the weaker SQL levels allow, and what do they gain?", "Reading: Berenson et al., A critique of ANSI SQL isolation levels, SIGMOD 1995"],
     "Where to look: DSC 7th ed., §17.5–17.8; self-study §18.9");
  cq("Constructivist question CQ10.2", "Why does two-phase locking guarantee serializability? Explain the idea of the lock point.",
     ["Order the transactions by their lock points", "If the precedence graph had a cycle, what would it say about the lock points?", "Why is 2PL sufficient but not necessary?"],
     "Where to look: self-study DSC 7th ed., §18.1; Eswaran et al., CACM 1976");
  cq("Constructivist question CQ10.3", "Why must a log record reach stable storage before the data page it describes (write-ahead logging)?",
     ["A crash after the data page is written but before its log record", "What can undo do without the old value?", "Relate the rule to the buffer policies of §19.5 (optional reading)"],
     "Where to look: self-study DSC 7th ed., §19.3");

  s = L.content(deck, "Self-study check: failures (§19.1)", ss("§19.1"));
  [["Transaction failure", "Logical error (bad input) or system error (deadlock): the transaction cannot continue"],
   ["System crash", "Volatile storage is lost; non-volatile storage is assumed intact"],
   ["Disk failure", "Part of non-volatile storage is destroyed; recover from archived copies"]].forEach((c, i) => {
    L.card(s, X0 + i * 4.1, 1.45, 3.9, 4.9, c[0], c[1], { num: i + 1 });
  });

  s = L.content(deck, "Self-study check: WAL (§19.3)", "Self-study; diagram drawn for IDB201 after DSC 7th ed., §19.3");
  L.code(s, "<T1 start>\n<T1, A, 500, 450>\n<T1, B, 300, 350>\n<T1 commit>", X0, 1.45, 4.6, 2.3);
  L.text(s, "<Ti, X, old value, new value>", X0, 3.85, 4.6, 0.5, { fontSize: SZ.caption, color: HEX.grey });
  L.node(s, "log buffer", 6.0, 1.5, 2.6, 0.9, { size: 20 });
  L.node(s, "data buffer", 9.9, 1.5, 2.6, 0.9, { size: 20 });
  L.node(s, "log on stable storage", 5.7, 4.4, 3.2, 0.95, { size: 20, fill: HEX.paleOrange });
  L.node(s, "data block on disk", 9.6, 4.4, 3.2, 0.95, { size: 20 });
  L.arrow(s, 7.3, 2.4, 7.3, 4.4, { label: "1  first", lx: 7.45, ly: 3.15, lw: 1.5, lalign: "left", labelColor: HEX.orange });
  L.arrow(s, 11.2, 2.4, 11.2, 4.4, { label: "2  then", lx: 11.35, ly: 3.15, lw: 1.5, lalign: "left" });
  L.text(s, "A transaction commits when its commit record reaches stable storage.", X0, 5.65, CW, 0.8, { bold: true, color: HEX.navy, fontSize: 22 });

  s = L.content(deck, "Self-study check: recovery (§19.4)", "Self-study; diagram drawn for IDB201 after DSC 7th ed., §19.4");
  const ly = 2.5;
  L.arrow(s, 0.8, ly, 12.4, ly, { color: HEX.grey, noHead: true });
  [["checkpoint", 1.3], ["T1 commit", 4.4], ["T2 start", 6.6], ["crash", 11.3]].forEach(([t, x]) => {
    s.addShape("line", { x, y: ly - 0.25, w: 0.001, h: 0.5, line: { color: t === "crash" ? HEX.red : HEX.navy, width: 3 } });
    L.text(s, t, x - 1.0, ly - 0.75, 2.0, 0.45, { fontSize: SZ.label, align: "center", color: t === "crash" ? HEX.red : HEX.navy, bold: true });
  });
  L.arrow(s, 1.3, 3.5, 11.3, 3.5, { color: HEX.navy, label: "redo phase: repeat history forward, build the undo-list", ly: 3.65, lx: 2.3, lw: 8.0, labelColor: HEX.navy });
  L.arrow(s, 11.3, 4.6, 6.6, 4.6, { color: HEX.orange, label: "undo phase: roll back T2 backward", ly: 4.75, lx: 6.6, lw: 4.7, labelColor: HEX.orange });
  L.text(s, "T1 committed before the crash: kept. T2 did not commit: undone, and <T2 abort> is written.", X0, 5.85, CW, 0.8, { fontSize: 22 });

  s = L.content(deck, "Practice exercises", "Exercises written for IDB201; more: DSC Practice Exercises 17.1–17.7 and 18.1–18.4; Lab 5 part 2");
  ["Is S = r1(A) r2(B) w1(B) w2(A) conflict serializable? Draw the precedence graph.",
   "Which isolation level prevents non-repeatable reads but still allows phantoms? How do you show the phantom in SQL Server?",
   "A transaction runs lock-X(A), write(A), unlock(A), lock-X(B), write(B), unlock(B). Is it two-phase? What can go wrong?"].forEach((q, i) => {
    L.card(s, X0, 1.45 + i * 1.72, CW, 1.55, null, `${i + 1}.  ${q}`, { fill: i % 2 ? HEX.pale : HEX.paleOrange, size: 24 });
  });

  s = L.content(deck, "Practice exercises: answers", "Answers written for IDB201; DSC 7th ed., §17.6, §17.8, §18.1");
  ["No. r1(A) before w2(A) gives T1 → T2; r2(B) before w1(B) gives T2 → T1: a cycle.",
   "Repeatable read. Session A counts the Hanoi accounts twice in one transaction; session B inserts a Hanoi account and commits in between; the second count is one higher (Lab 5, task 2.2c).",
   "No: it locks B after unlocking A. Another transaction can read A and B in between and see only half of the work, so the schedule may not be serializable."].forEach((q, i) => {
    L.card(s, X0, 1.45 + i * 1.72, CW, 1.55, null, `${i + 1}.  ${q}`, { fill: HEX.pale, size: 22 });
  });

  s = L.content(deck, "Summary", "DSC 7th ed., Ch. 17 (taught); Ch. 18–19 (self-study)");
  [["Transactions", "ACID; read/write model; states; transactions in SQL"],
   ["Serializability", "Conflicts; precedence graphs; serial orders"],
   ["Recoverability", "Recoverable and cascadeless schedules"],
   ["Isolation levels", "Anomalies; SQL levels; SQL Server behavior in Lab 5"],
   ["Self-study Ch. 18", "Two-phase locking; deadlocks; phantoms; snapshot isolation"],
   ["Self-study Ch. 19", "Failures; write-ahead logging; redo and undo"]].forEach((c, i) => {
    L.card(s, X0 + (i % 3) * 4.1, 1.45 + Math.floor(i / 3) * 2.6, 3.9, 2.4, c[0], c[1], { size: 20, fill: i >= 4 ? HEX.paleOrange : HEX.pale });
  });

  s = L.content(deck, "Before the next session", "IDB201 syllabus, Schedule sessions 55–58 and Grading structure");
  L.card(s, X0, 1.45, 3.9, 4.9, "Within one week", "Choose one of CQ10.1–CQ10.3 and submit a 150–200-word answer on the LMS.", { num: 1 });
  L.card(s, X0 + 4.1, 1.45, 3.9, 4.9, "Session 56", "Progress test 2: Chapters 6–10, including the self-study of DSC Ch. 18–19. 20 questions, 30 minutes.", { num: 2, fill: HEX.paleOrange });
  L.card(s, X0 + 8.2, 1.45, 3.9, 4.9, "Sessions 57–58", "Final presentations. The report and SQL scripts are due three days before session 57.", { num: 3 });
};

// Progress test 2 (session 56): Chapters 6–10, taken after the last Chapter 10 session (55) and before the
// project presentations (57–58). Scope from the Grading structure of the syllabus (24 Nov 2026):
// DSC Ch. 6–7; Ch. 13, §13.1–13.3, §13.5; Ch. 14, §14.1–14.3, §14.5, §14.7; Ch. 15, §15.1–15.5;
// Ch. 16, §16.1–16.2; Ch. 17; and their self-study readings, including DSC Ch. 18–19.
// 20 MCQ, 4 per chapter; marked by computer; no item is taken from the final-exam bank (BM.10, BM.12).
// In each item the first option is the key; the builder shuffles the options and balances the key positions.
module.exports = [
  // ---------------- Chapter 6 (CLO2)
  { ch: 6, s: "A library member may borrow many book copies over time, and each loan records a loan date and a due date. Where should loan_date and due_date be placed in the E-R model?",
    o: ["On the relationship set between member and copy", "On the entity set member, as single-valued attributes", "On the entity set copy, as single-valued attributes", "On member, as multivalued attributes, one per copy"], l: "Ap", t: "T", ref: "§6.2; §6.9" },
  { ch: 6, s: "Each section is held in at most one classroom, and a classroom holds many sections. In the notation of DSC, where is the arrow of the relationship set sec_class drawn?",
    o: ["On the line from sec_class towards classroom", "On the line from sec_class towards section", "On both lines, towards section and towards classroom", "On neither line, as the relationship is many-to-many"], l: "Ap", t: "P", ref: "§6.4" },
  { ch: 6, s: "Every instructor works in exactly one department, and every department must have at least one instructor. inst_dept is reduced to a not-null foreign key dept_name in instructor. Which part of the rule does the relational schema NOT enforce?",
    o: ["Every department has at least one instructor", "Every instructor works in at most one department", "Every instructor works in at least one department", "A department may have many instructors"], l: "An", t: "T", ref: "§6.4; §6.7" },
  { ch: 6, s: "In crow's-foot notation, how is the rule 'an instructor advises many students; a student has at most one advisor' drawn on the line between instructor and student?",
    o: ["A crow's foot at the student end and a single bar at the instructor end", "A crow's foot at the instructor end and a single bar at the student end", "A crow's foot at both ends of the line between the two entity sets", "A single bar at both ends of the line between the two entity sets"], l: "U", t: "T", ss: 1, ref: "§6.10" },
  // ---------------- Chapter 7 (CLO5)
  { ch: 7, s: "R(A, B, C, D) with F = { AB → C, C → D, D → A }. Which set is a candidate key of R?",
    o: ["{B, D}", "{A, C}", "{D}", "{A, B, C}"], l: "Ap", t: "P", ref: "§7.4" },
  { ch: 7, s: "R(A, B, C) with F = { A → B, B → A, A → C }. Which statement is correct?",
    o: ["R is in BCNF, and A and B are both candidate keys", "R is in 3NF but not in BCNF, because of B → A", "R is not in 3NF, because C depends on A only", "R is not in BCNF, because it has two candidate keys"], l: "An", t: "P", ref: "§7.3; §7.4" },
  { ch: 7, s: "R(A, B, C, D, E) with F = { A → BC, D → E } is decomposed into R1(A, B, C) and R2(A, D, E). Which statement is correct?",
    o: ["It is lossless, because the common attribute A is a key of R1", "It is lossless, because D → E holds within R2", "It is lossy, because A is not a key of R2", "It is lossy, because the schemas share only one attribute"], l: "An", t: "P", ref: "§7.4.4" },
  { ch: 7, s: "Why may a designer choose a 3NF decomposition instead of a BCNF decomposition?",
    o: ["3NF can always preserve the dependencies; BCNF cannot always", "3NF is always lossless; a BCNF decomposition may be lossy", "3NF removes all redundancy due to FDs; BCNF does not", "3NF relations never contain nulls; BCNF relations may"], l: "U", t: "T", ref: "§7.3.3; §7.5" },
  // ---------------- Chapter 8 (CLO6)
  { ch: 8, s: "Why does a database system manage its own buffer instead of relying only on the operating system?",
    o: ["It can predict its access pattern and must control when blocks are written to disk", "The operating system cannot keep database blocks in main memory at all", "Its buffer replaces the disk, so modified blocks never need to be written", "It reads whole files at once, so it does not need a replacement policy"], l: "U", t: "T", ref: "§13.5" },
  { ch: 8, s: "A file of 60,000 records, sorted on its search key, stores 30 records per block. A sparse clustering index has one entry per block. How many entries does the index have?",
    o: ["2,000", "30", "1,800", "60,000"], l: "Ap", t: "P", ref: "§14.2" },
  { ch: 8, s: "A B+-tree with n = 4 (at most 3 keys per node) has the root [15 | 45] and the leaves [5, 10], [15, 25, 35] and [45, 55]. The key 30 is inserted. What does the root contain afterwards?",
    o: ["[15 | 30 | 45]", "[15 | 25 | 45]", "[15 | 45]", "[30]"], l: "Ap", t: "P", ref: "§14.3.3" },
  { ch: 8, s: "A hash index exists on instructor.salary. Which condition can this index NOT help to evaluate?",
    o: ["where salary between 60000 and 80000", "where salary = 65000", "where salary = 65000 and dept_name = 'Physics'", "where salary in (65000, 78000)"], l: "U", t: "P", ref: "§14.5" },
  // ---------------- Chapter 9 (CLO6)
  { ch: 9, s: "Relation r has 600 blocks and s has 150 blocks, and M = 22 memory blocks are available. How many block transfers does block nested-loop join need with s as the outer relation, using ⌈bs / (M − 2)⌉ · br + bs?",
    o: ["4,950", "4,800", "750", "90,150"], l: "Ap", t: "P", ref: "§15.5.2" },
  { ch: 9, s: "r has 1,000 blocks. A secondary B+-tree index of height 3 exists on the non-key attribute A, and A = v matches 300 records in different blocks. With tT = 0.1 ms and tS = 4 ms, which plan is cheaper?",
    o: ["The linear scan: about 104 ms against about 1,242 ms", "The index: about 104 ms against about 1,242 ms", "The index, because it reads fewer blocks than the scan", "Neither: both plans read all 1,000 blocks of r"], l: "An", t: "P", ref: "§15.2; §15.3" },
  { ch: 9, s: "Which rewrite of σ dept_name = 'Physics' (instructor ⋈ teaches) is always equivalent to it?",
    o: ["σ dept_name = 'Physics' (instructor) ⋈ teaches", "instructor ⋈ σ dept_name = 'Physics' (teaches)", "σ dept_name = 'Physics' (instructor ⋈ σ dept_name = 'Physics' (teaches))", "Π dept_name (instructor) ⋈ teaches"], l: "U", t: "P", ref: "§16.2" },
  { ch: 9, s: "instructor has 12,000 tuples and V(dept_name, instructor) = 30. Assuming that the values are distributed uniformly, what is the estimated number of tuples of σ dept_name = 'Physics' (instructor)?",
    o: ["400", "30", "1,200", "12,000"], l: "Ap", t: "P", ss: 1, ref: "§16.3" },
  // ---------------- Chapter 10 (CLO7)
  { ch: 10, s: "S = r1(X) r2(X) w1(X) w2(X). Which statement is correct?",
    o: ["S is not conflict serializable: its precedence graph has a cycle", "S is conflict serializable and equivalent to T1 followed by T2", "S is conflict serializable and equivalent to T2 followed by T1", "S is serial, because each transaction reads X before writing it"], l: "An", t: "P", ref: "§17.6" },
  { ch: 10, s: "Which anomaly can still occur at the isolation level read committed?",
    o: ["Non-repeatable read", "Dirty read", "Dirty write", "None: read committed is serializable"], l: "U", t: "T", ref: "§17.8" },
  { ch: 10, s: "Under strict two-phase locking, when does a transaction release its exclusive locks?",
    o: ["Only when it commits or aborts", "As soon as it has written the item", "As soon as it requests its last lock", "Whenever another transaction waits for it"], l: "R", t: "T", ss: 1, ref: "§18.1" },
  { ch: 10, c: "<T1 start>  <T1, A, 100, 50>  <T1 commit>  <T2 start>  <T2, B, 200, 300>   (crash)", s: "After a crash, the log on stable storage ends as shown (<T, X, old value, new value>). With the recovery algorithm of DSC §19.4, what are the values of A and B after recovery?",
    o: ["A = 50, B = 200: T1 is redone and T2 is undone", "A = 100, B = 300: T1 is undone and T2 is redone", "A = 50, B = 300: both transactions are redone", "A = 100, B = 200: both transactions are undone"], l: "An", t: "P", ss: 1, ref: "§19.3; §19.4" },
];

// IDB201 – exercise sheets for Chapter 9 (session 47) and Chapter 10 (session 53), with solutions.
// Usage: node build_ch9_ch10.js <outdir>
// Same layout as the other exercise sheets (docx_common.js). Data: the course database University (givenDB).
const path = require("path");
const { P, H2, code, table, box, titleBlock, build } = require("../docx_common");

const out = process.argv[2] || path.join(__dirname, "out");

// Each question: { q: text, extra: [blocks], a: [answer paragraphs or blocks] }
function sheet(spec, withAnswers) {
  const kids = [...titleBlock(spec.title + (withAnswers ? " – solutions" : ""), spec.subtitle, spec.meta)];
  spec.intro.forEach((t) => kids.push(P(t)));
  let n = 0;
  for (const part of spec.parts) {
    kids.push(H2(part.h));
    for (const it of part.items) {
      n += 1;
      kids.push(P(`**${n}.** ${it.q}`, { keepNext: true }));
      (it.extra || []).forEach((b) => kids.push(...(Array.isArray(b) ? b : [b])));
      if (withAnswers) it.a.forEach((x, i) => {
        if (typeof x === "string") kids.push(P(i === 0 ? `**Answer.** ${x}` : x));
        else kids.push(...x);
      });
    }
  }
  if (spec.closing) kids.push(...box(spec.closing[0], spec.closing[1]));
  return kids;
}

// ------------------------------------------------------------------ Chapter 9
const ch9 = {
  file: "IDB201_Ch9_Query_Processing_Exercises",
  title: "Exercises: query processing and optimization",
  subtitle: "Chapter 9 – guided exercises in session 47 (on paper and in SQL Server)",
  meta: [["Session", "47"], ["CLO", "CLO6"],
    ["Textbook", "DSC Ch. 15, §15.1–15.5; Ch. 16, §16.1–16.2; self-study §16.3; Exercises pp. 736–739, 789–793"],
    ["Database", "University (givenDB, university_sqlserver.sql) for questions 11–12"]],
  intro: [
    "Use the cost model of DSC §15.2: b block transfers and S seeks cost b · tT + S · tS, with tT = 0.1 ms and tS = 4 ms. br is the number of blocks of r, nr its number of tuples, hi the height of index i and M the number of memory blocks. Writing the final result is not counted.",
    "Questions 1–10 are solved on paper. Questions 11–12 are run in SQL Server on the database University with Include Actual Execution Plan (Ctrl+M); compare what you see with your answers on paper.",
  ],
  parts: [
    { h: "Part A – selection and sorting", items: [
      { q: "Relation r has 2,000 blocks. A secondary B+-tree index of height 3 exists on the non-key attribute A, and the condition A = v matches 30 records stored in 30 different blocks. Compare the time of the index plan (A4) with a linear scan (A1). For how many matching records do the two plans cost about the same?",
        a: ["Index plan (A4, non-key): (hi + n) · (tT + tS) = (3 + 30) · 4.1 = 135.3 ms. Linear scan (A1): tS + br · tT = 4 + 2,000 · 0.1 = 204 ms. The index wins.",
            "Break-even: (3 + n) · 4.1 = 204 gives n ≈ 46.8. With 46 matches the index costs 200.9 ms, with 47 it costs 205 ms: above about 47 matching records the scan is cheaper (DSC §15.3)."] },
      { q: "Same relation r, but now the B+-tree on A is a clustering index of height 3, and the matching records fill b = 12 consecutive blocks. Compute the time of the index plan (A3).",
        a: ["A3: hi · (tT + tS) + tS + b · tT = 3 · 4.1 + 4 + 12 · 0.1 = 12.3 + 4 + 1.2 = 17.5 ms. The matching records are stored together, so one seek and 12 sequential transfers replace one seek per record."] },
      { q: "instructor has an index on dept_name and no index on salary. Describe two plans for σ dept_name = 'Physics' ∧ salary > 80000 (instructor). When would an index on salary, as well, allow a third plan?",
        a: ["Plan 1: linear scan, testing both conditions on every tuple (A1). Plan 2: use the index on dept_name to fetch the Physics tuples and test salary > 80000 in memory (A7, conjunctive selection using one index).",
            "With an ordered index on salary too, the system can fetch the record pointers that satisfy each condition from its index, intersect the two sets of pointers, and read only the records in the intersection (A9). This pays off when each condition alone matches many records but both together match few."] },
      { q: "Sort a relation of br = 1,000 blocks by external sort-merge, first with M = 11 memory blocks and then with M = 101. For each case give the number of initial runs, the number of merge passes and the block transfers (not counting the final write).",
        a: [[...table([2, 3, 3, 3], ["M", "Initial runs ⌈br / M⌉", "Merge passes ⌈log(M−1)(br / M)⌉", "Transfers br (2 · passes + 1)"],
          [["11", "⌈1,000 / 11⌉ = 91", "⌈log10 91⌉ = 2", "1,000 · 5 = 5,000"], ["101", "⌈1,000 / 101⌉ = 10", "⌈log100 10⌉ = 1", "1,000 · 3 = 3,000"]])],
          "More memory means fewer, longer runs and fewer merge passes; each pass reads and writes the whole relation (DSC §15.4)."] },
    ] },
    { h: "Part B – join algorithms", items: [
      { q: "r has 1,000 blocks and s has 200 blocks; the join is an equi-join. Compute the block transfers of block nested-loop join with M = 3 and with M = 52, each time with r as the outer relation and with s as the outer relation. Compare with merge join (both inputs already sorted) and hash join (no recursive partitioning).",
        a: [[...table([4, 5, 2], ["Algorithm", "Computation", "Transfers"], [
          ["Block nested loop, M = 3, r outer", "1,000 · 200 + 1,000", "201,000"],
          ["Block nested loop, M = 3, s outer", "200 · 1,000 + 200", "200,200"],
          ["Block nested loop, M = 52, r outer", "⌈1,000 / 50⌉ · 200 + 1,000", "5,000"],
          ["Block nested loop, M = 52, s outer", "⌈200 / 50⌉ · 1,000 + 200", "4,200"],
          ["Merge join (sorted inputs)", "1,000 + 200", "1,200"],
          ["Hash join", "3 · (1,000 + 200)", "about 3,600"]])],
          "With M blocks, block nested-loop join keeps M − 2 blocks of the outer relation in memory: ⌈br / (M − 2)⌉ · bs + br (DSC §15.5.2). The smaller relation should be the outer one."] },
      { q: "In the running example of DSC, student has 5,000 tuples in 100 blocks and takes has 10,000 tuples in 400 blocks. Compute the block transfers of an indexed nested-loop join (a) with student as the outer relation and a B+-tree on takes(ID) whose lookups read 4 index nodes and 1 data block; (b) with takes as the outer relation and a B+-tree of height 3 on student(ID). Which is better, and why?",
        a: ["(a) br + nr · c = 100 + 5,000 · 5 = 25,100. (b) 400 + 10,000 · (3 + 1) = 40,400.",
            "(a) is better: the cost is driven by the number of tuples of the outer relation, one lookup each, and student has half as many tuples as takes (DSC §15.5.3)."] },
      { q: "Which join algorithms can evaluate r ⋈ s with the condition r.A < s.B? Explain why the others cannot.",
        a: ["Nested-loop and block nested-loop join work for any condition. An indexed nested-loop join is possible with an ordered (B+-tree) index on s.B: for each tuple of r, scan the index from r.A upwards.",
            "Merge join and hash join need an equality condition: merging matches equal values, and hashing sends only equal values to the same partition (DSC §15.5.4–15.5.5)."] },
    ] },
    { h: "Part C – estimates, equivalence rules and join orders", items: [
      { q: "instructor has 10,000 tuples, V(dept_name, instructor) = 20, and salary ranges from 30,000 to 130,000. Estimate the number of tuples of (a) σ dept_name = 'Physics' (instructor); (b) σ salary > 80000 (instructor); (c) the conjunction of both conditions; (d) takes ⋈ student on ID, where takes has 10,000 tuples and takes.ID is a foreign key to student. State the assumptions.",
        a: ["(a) nr / V(dept_name, r) = 10,000 / 20 = 500, assuming the values are spread uniformly.",
            "(b) nr · (max − v) / (max − min) = 10,000 · (130,000 − 80,000) / (130,000 − 30,000) = 5,000, assuming a uniform distribution of salaries.",
            "(c) nr · s1/nr · s2/nr = 10,000 · (500 / 10,000) · (5,000 / 10,000) = 250, assuming the two conditions are independent.",
            "(d) Each takes tuple joins exactly one student tuple, so the result has 10,000 tuples (DSC §16.3, self-study). If salary depends on the department, (c) can be far off: this is the subject of CQ9.1."] },
      { q: "Rewrite Π name (σ dept_name = 'Physics' ∧ year = 2025 (instructor ⋈ teaches)) so that each selection is applied as early as possible. Name the equivalence rules you use and draw the expression tree.",
        a: ["Rule 1 splits the conjunction into two selections; rule 7 pushes each one to the input that has its attribute (dept_name belongs to instructor, year to teaches):",
          code("Π name (σ dept_name = 'Physics' (instructor) ⋈ σ year = 2025 (teaches))\n\n                Π name\n                  |\n                  ⋈\n          /               \\\nσ dept_name='Physics'   σ year=2025\n        |                    |\n   instructor             teaches"),
          "On University the result is Curie: Bohr is the other Physics instructor, but he teaches in 2026."] },
      { q: "How many different join orders do 4 relations have? How many of them are left-deep join trees? Why do optimizers often consider only left-deep trees?",
        a: ["All join orders: (2(n − 1))! / (n − 1)! = 6! / 3! = 120. Left-deep trees: n! = 24 (DSC §16.4, optional reading).",
            "In a left-deep tree the right input of every join is a stored relation, so it can be read through an index or pipelined; the search space is much smaller, at the risk of missing a cheaper bushy plan (CQ9.3)."] },
    ] },
    { h: "Part D – comparing with SQL Server (database University)", items: [
      { q: "Run the query below with set statistics io on and the actual execution plan. Where are the two conditions applied in the plan? Which join operator is chosen, and why for such small tables? Compare the estimated and the actual number of rows of each operator.",
        extra: [code("set statistics io on;\nselect i.name\nfrom   instructor i\n       join teaches t on i.ID = t.ID\nwhere  i.dept_name = 'Physics'\n  and  t.year = 2025;")],
        a: ["The result is one row, Curie. Each condition is applied as a predicate on the access to its own table (on instructor and on teaches), not after the join: the optimizer has pushed the selections down as in question 9.",
            "With a dozen rows per table, the expected join operator is Nested Loops (one seek or a small scan per outer row); a hash or merge join would cost more to set up than it saves. The plan may differ between machines; explain the one you see.",
            "Estimated and actual rows are close on such small tables, because the statistics describe the data exactly. Lab 5 part 1 repeats the comparison on student_big and takes_big, where the operators change."] },
      { q: "Write the query 'names of the students who took CS-101' in three ways: with a join (and distinct), with in, and with exists. Do the three return the same rows? Do they get the same plan?",
        a: [code("select distinct s.name from student s join takes t on t.ID = s.ID where t.course_id = 'CS-101';\nselect s.name from student s where s.ID in (select ID from takes where course_id = 'CS-101');\nselect s.name from student s where exists\n  (select * from takes t where t.ID = s.ID and t.course_id = 'CS-101');"),
          "All three return the same 9 students on University (An, Bao, Binh, Chau, Giang, Minh, Quang, Thao, Viet). A student who took CS-101 twice would appear twice in the join without distinct.",
          "SQL Server usually translates in and exists into the same semi-join, while the join version needs a join followed by duplicate elimination; the plans can therefore differ although the results are equal. This is the question of CQ9.2: the optimizer sees the algebra after translation, not the SQL text (DSC §16.2)."] },
    ] },
  ],
  closing: ["More practice", ["DSC Practice Exercises 15.1–15.5 and 16.1–16.4; Lab 5 part 1 (session 48)."]],
};

// ------------------------------------------------------------------ Chapter 10
const ch10 = {
  file: "IDB201_Ch10_Transactions_Exercises",
  title: "Exercises: transactions and concurrency",
  subtitle: "Chapter 10 – guided exercises in session 53 (on paper), with questions on the Chapter 18 self-study",
  meta: [["Session", "53"], ["CLO", "CLO7"],
    ["Textbook", "DSC Ch. 17, §17.5–17.9; Exercises pp. 831–833; self-study Ch. 18, §18.1–18.2, §18.4, §18.8"],
    ["Database", "The account table of Lab 5 (lab5_large.sql) for questions 5, 8 and 9"]],
  intro: [
    "Notation: ri(X) and wi(X) are a read and a write of item X by transaction Ti; ci and ai are its commit and abort. Two operations conflict when they belong to different transactions, access the same item, and at least one of them is a write (DSC §17.6).",
    "Questions 1–5 practice Chapter 17. Questions 6–9 check the self-study of Chapter 18, which prepares Lab 5 part 2 (session 54) and is assessed in Progress test 2.",
  ],
  parts: [
    { h: "Part A – serializability and recoverability (DSC Ch. 17)", items: [
      { q: "S = r1(A) r2(B) w2(A) r3(A) w3(B) w1(B). List every conflicting pair, draw the precedence graph and decide whether S is conflict serializable.",
        a: ["Item A: r1(A) before w2(A) gives T1 → T2; w2(A) before r3(A) gives T2 → T3. Item B: r2(B) before w3(B) gives T2 → T3; r2(B) before w1(B) gives T2 → T1; w3(B) before w1(B) gives T3 → T1.",
            "Edges T1 → T2, T2 → T1, T2 → T3, T3 → T1. The graph has the cycles T1 → T2 → T1 and T1 → T2 → T3 → T1, so S is not conflict serializable."] },
      { q: "S = r1(B) w1(B) r2(B) w2(B) r1(A) w1(A) r2(A) w2(A). Is S conflict serializable? If yes, give the equivalent serial schedule and show the swaps that lead to it.",
        a: ["All conflicts go from T1 to T2 (on B and on A): the precedence graph has the single edge T1 → T2 and no cycle, so S is conflict serializable and equivalent to T1 T2.",
            "Swaps: r1(A) and w1(A) do not conflict with r2(B) or w2(B) (different items), so they can be moved before r2(B), giving r1(B) w1(B) r1(A) w1(A) r2(B) w2(B) r2(A) w2(A) = T1 T2 (DSC §17.6)."] },
      { q: "For each schedule, decide whether it is recoverable and whether it is cascadeless: S1 = w1(A) r2(A) c2 c1; S2 = w1(A) r2(A) c1 c2; S3 = w1(A) c1 r2(A) c2.",
        a: [[...table([4, 2, 2, 5], ["Schedule", "Recoverable", "Cascadeless", "Reason"], [
          ["S1 = w1(A) r2(A) c2 c1", "no", "no", "T2 read from T1 and commits first; if T1 aborts, T2 cannot be undone"],
          ["S2 = w1(A) r2(A) c1 c2", "yes", "no", "T2 commits after T1, but it read an uncommitted value"],
          ["S3 = w1(A) c1 r2(A) c2", "yes", "yes", "T2 reads only committed data"]])],
          "Every cascadeless schedule is recoverable, but not the other way round (DSC §17.7)."] },
      { q: "In S = w1(A) r2(A) w2(B) r3(B) a1, transaction T1 aborts. Which transactions must also be rolled back, and why? How does a cascadeless schedule avoid this?",
        a: ["T2 read A from T1, so it must roll back; T3 read B from T2, so it must roll back too: a cascading rollback (DSC §17.7.2).",
            "In a cascadeless schedule a transaction reads only values of committed transactions, so an abort never reaches another transaction. Strict two-phase locking guarantees this (question 6)."] },
      { q: "Using the account table of Lab 5, give the lowest isolation level that is safe for each requirement: (a) a report must never show a transfer that is later rolled back; (b) a transaction reads the balance of account 3 twice and must see the same value; (c) a transaction counts the Hanoi accounts twice and must see the same count.",
        a: ["(a) Read committed: it prevents dirty reads. (b) Repeatable read: rows already read cannot change until the transaction ends. (c) Serializable: it also prevents phantoms, so a new Hanoi account must wait (DSC §17.8; Lab 5 part 2 shows each case in SQL Server)."] },
    ] },
    { h: "Part B – questions on the Chapter 18 self-study", items: [
      { q: "Do the transactions below follow two-phase locking? Do they follow strict two-phase locking? Where is the lock point?",
        extra: [code("T1: lock-S(A); read(A); lock-X(B); unlock(A); write(B); unlock(B); commit\nT2: lock-S(A); read(A); unlock(A); lock-X(B); write(B); unlock(B); commit")],
        a: ["T1 follows two-phase locking: it acquires all its locks (growing phase) before its first unlock (shrinking phase); its lock point is lock-X(B). It is not strict, because it releases the exclusive lock on B before it commits.",
            "T2 does not follow two-phase locking: it requests lock-X(B) after unlock(A). Strict two-phase locking would keep lock-X(B) until commit, which makes schedules cascadeless (DSC §18.1)."] },
      { q: "A wait-for graph has the edges T1 → T2, T2 → T3, T3 → T1 and T4 → T1 (Ti → Tj: Ti waits for a lock held by Tj). Is there a deadlock? Which transactions are involved, and how is it resolved?",
        a: ["Yes: the cycle T1 → T2 → T3 → T1 is a deadlock. T4 waits for T1 but is not on the cycle.",
            "The system rolls back one transaction of the cycle (the victim, e.g. the one that has done the least work); the others continue, and T4 proceeds once T1 has released its locks. SQL Server reports error 1205 to the victim, as observed in Lab 5 (DSC §18.2)."] },
      { q: "Transaction A counts the Hanoi accounts with select count(*) from account where branch = 'Hanoi'; transaction B inserts a new Hanoi account. Why do locks on the tuples read by A not prevent the phantom? What does a serializable system lock instead?",
        a: ["A locks only the four tuples that exist when it reads them; the new tuple does not exist yet, so B's insert conflicts with A's predicate, not with any tuple A has locked.",
            "The system must lock the predicate or the part of an index that covers it (index locking, DSC §18.4). SQL Server at serializable takes key-range locks, so B's insert waits until A ends."] },
      { q: "Snapshot isolation (§18.8). Accounts 1 and 2 (An 500, Binh 300) must together hold at least 400. Under snapshot isolation, T1 reads both balances and takes 300 from account 1, while at the same time T2 reads both balances and takes 300 from account 2. Both see a total of 800 and both commit. What is the final total, what is this anomaly called, and why does snapshot isolation allow it?",
        a: ["Final balances 200 and 0: the total is 200, which violates the rule. This is write skew.",
            "Each transaction read the same snapshot and wrote a different item, so there is no write–write conflict for snapshot isolation to detect, although the result is not serializable. A serializable level (or locking the item that encodes the rule) prevents it (DSC §18.8)."] },
    ] },
  ],
  closing: ["More practice", ["DSC Practice Exercises 17.1–17.7 and 18.1–18.4; Lab 5 part 2 (session 54)."]],
};

(async () => {
  for (const s of [ch9, ch10]) {
    await build(path.join(out, s.file + ".docx"), sheet(s, false), { title: s.title });
    await build(path.join(out, s.file + "_Solutions.docx"), sheet(s, true), { title: s.title + " – solutions" });
  }
})();

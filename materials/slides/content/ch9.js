// Chapter 9 – Query processing and optimization (sessions 45, 46, 47)
module.exports = {
  num: 9,
  title: "Query processing and query optimization",
  short: "Query processing",
  sessions: [45, 46, 47],
  reading: "DSC Ch. 15, §15.1–15.5, pp. 689–718; Ch. 16, §16.1–16.2, pp. 743–756",
  slides: [
    { t: "outline", title: "Chapter 9 roadmap", items: [
      { session: 45, head: "Basics", points: ["15.1 Overview of query processing", "15.2 Measures of query cost", "15.3 Selection", "15.4 External sort-merge"] },
      { session: 46, head: "Joins", points: ["15.5 Nested-loop, block nested-loop, indexed nested-loop", "Merge join, hash join", "Cost comparison"] },
      { session: 47, head: "Optimization", points: ["16.1 Overview", "16.2 Equivalence rules", "Execution plans in SQL Server", "CQ9.1–CQ9.3"] },
    ] },

    // ---------------- Session 45 ----------------
    { t: "session", n: 45, title: "Overview of query processing, measures of query cost, selection, sorting", reading: "DSC Ch. 15, §15.1–15.4, pp. 689–703" },
    { t: "cards", title: "15.1 Overview of query processing", items: [
      { head: "1. Parsing and translation", body: "Check syntax and names; translate the SQL query into an internal form based on relational algebra." },
      { head: "2. Optimization", body: "Choose, among equivalent evaluation plans, one with low estimated cost." },
      { head: "3. Evaluation", body: "The execution engine runs the chosen plan and returns the result." },
    ], notes: "An evaluation plan annotates each algebra operation with the algorithm and indices to use. DSC example: σsalary<75000 can be evaluated by a scan or by an index on salary." },
    { t: "bullets", title: "15.2 Measures of query cost", bullets: [
      "Disk access usually dominates; DSC measures cost by block transfers and seeks",
      { b: "Cost model:", t: "b · tT + S · tS, for b block transfers and S seeks; tT = time to transfer one block, tS = average seek time" },
      "CPU cost is ignored in the simple model; so is the cost of writing the final result",
      "Estimates assume the worst case for buffer availability unless stated otherwise",
      "Notation used below: br = number of blocks of r, nr = number of tuples of r, hi = height of index i",
    ] },
    { t: "table", title: "15.3 Selection algorithms (main cases)", colW: [4.6, 4.0, 3.7], head: ["Algorithm", "Condition", "Cost"], rows: [
      ["A1 Linear search", "any", "tS + br · tT"],
      ["A1, equality on a key", "stop at first match", "on average tS + (br/2) · tT"],
      ["A2 Clustering index, key", "equality", "(hi + 1) · (tT + tS)"],
      ["A3 Clustering index, non-key", "equality, b matching blocks", "hi · (tT + tS) + tS + b · tT"],
      ["A4 Secondary index, key", "equality", "(hi + 1) · (tT + tS)"],
      ["A4 Secondary index, non-key", "equality, n matching records", "(hi + n) · (tT + tS)"],
    ], caption: "A secondary index on a non-key can be worse than a linear scan when n is large (see Chapter 8, Exercise 3).", size: 14 },
    { t: "bullets", title: "Complex selections", bullets: [
      { b: "Comparisons (A5, A6):", t: "σA≥v uses an ordered index to find the first match, then scans in order" },
      { b: "Conjunction:", t: "use one index for one condition and test the others in memory; or intersect record pointers from several indices" },
      { b: "Disjunction:", t: "union of record pointers from indices, only if every condition has an index; otherwise a linear scan" },
      { b: "Negation:", t: "usually a linear scan" },
      "Bitmap indices (DSC §14.9, beyond this course) make intersections and unions of pointer sets cheap",
    ] },
    { t: "code", title: "15.4 External sort-merge", side: "Cost (DSC §15.4)", code:
"-- M = number of memory blocks available\n-- Stage 1: create sorted runs\nrepeat\n    read M blocks of r into memory;\n    sort them in memory;\n    write the sorted run Ri to disk;\nuntil the end of r;\n\n-- Stage 2: merge the runs\n-- merge M - 1 runs at a time (one block for output),\n-- repeating passes until a single run remains",
      bullets: ["Initial runs: ⌈br / M⌉", "Merge passes: ⌈log(M−1)(br / M)⌉", "Block transfers: br · (2 ⌈log(M−1)(br / M)⌉ + 1), not counting the final write", "Sorting matters for order by, merge join, duplicate elimination and grouping"] },

    // ---------------- Session 46 ----------------
    { t: "session", n: 46, title: "Join operation: nested-loop, block nested-loop, indexed nested-loop, merge join and hash join; cost comparison", reading: "DSC Ch. 15, §15.5, pp. 704–718 · Self-study: §15.6, pp. 719–723; §15.7 (pipelining), pp. 724–730" },
    { t: "code", title: "Nested-loop and block nested-loop join", side: "Cost, worst case", code:
"-- nested-loop join of r and s on θ\nfor each tuple tr in r do\n    for each tuple ts in s do\n        if (tr, ts) satisfies θ then\n            add tr · ts to the result;\n\n-- block nested-loop join\nfor each block Br of r do\n    for each block Bs of s do\n        for each tuple tr in Br do\n            for each tuple ts in Bs do\n                if (tr, ts) satisfies θ then\n                    add tr · ts to the result;",
      bullets: ["Nested loop: nr · bs + br transfers, nr + br seeks", "Block nested loop: br · bs + br transfers, 2 · br seeks", "If the smaller relation fits in memory: br + bs transfers", "With M blocks: ⌈br / (M − 2)⌉ · bs + br transfers"], codeSize: 13 },
    { t: "twocol", title: "Indexed nested-loop, merge and hash join", left: { head: "Indexed nested-loop join", items: [
      "For each tuple of the outer relation r, look up matching tuples of s with an index",
      "Cost: br · (tT + tS) + nr · c, where c is the cost of one index lookup",
      "Good when r is small and s has an index on the join attribute",
    ] }, right: { head: "Merge join and hash join (equi-joins)", items: [
      "Merge join: sort both relations on the join attributes, then merge; br + bs transfers once sorted",
      "Hash join: partition both relations with the same hash function, then build and probe one partition pair at a time",
      "Hash join cost without recursive partitioning: about 3 (br + bs) block transfers",
    ] } },
    { t: "table", title: "Cost comparison: student ⋈ takes", lead: "DSC running example. student: nr = 5,000 tuples, br = 100 blocks. takes: ns = 10,000 tuples, bs = 400 blocks.", colW: [5.6, 3.6, 3.1], head: ["Algorithm", "Block transfers", "Assumption"], rows: [
      ["Nested loop, student outer", "5,000 · 400 + 100 = 2,000,100", "worst case"],
      ["Nested loop, takes outer", "10,000 · 100 + 400 = 1,000,400", "worst case"],
      ["Block nested loop, student outer", "100 · 400 + 100 = 40,100", "worst case"],
      ["Block nested loop, enough memory", "100 + 400 = 500", "best case"],
      ["Merge join (inputs sorted)", "100 + 400 = 500", "plus sorting if needed"],
      ["Hash join", "about 3 · (100 + 400) = 1,500", "no recursive partitioning"],
    ], caption: "Indexed nested loop with a B+-tree on takes(ID) of height 4: about 100 + 5,000 · 5 = 25,100 (each lookup: 4 index nodes + 1 data block)." },

    // ---------------- Session 47 ----------------
    { t: "session", n: 47, title: "Overview of query optimization; equivalence rules; reading execution plans in SQL Server", reading: "DSC Ch. 16, §16.1–16.2, pp. 743–756 · Self-study: §16.3, pp. 757–765; optional §16.4, pp. 766–777" },
    { t: "bullets", title: "16.1 Overview of query optimization", bullets: [
      "A query has many equivalent expressions and, for each, many evaluation plans",
      "Cost-based optimization: generate equivalent expressions, annotate them with algorithms, estimate the cost of each plan, choose the cheapest",
      "Estimates use statistics about relations: number of tuples, distinct values, histograms (self-study §16.3)",
      "The difference between a good and a bad plan can be several orders of magnitude",
    ], card: { head: "Example (DSC §16.1)", body: "Names of instructors in Music with the titles of courses they teach:\nperform σdept_name='Music' on instructor before joining with teaches and course." } },
    { t: "table", title: "16.2 Selected equivalence rules", colW: [0.7, 6.4, 5.2], head: ["#", "Rule", "Use"], rows: [
      ["1", "σθ1∧θ2(E) ≡ σθ1(σθ2(E))", "split a conjunctive selection"],
      ["2", "σθ1(σθ2(E)) ≡ σθ2(σθ1(E))", "selections commute"],
      ["4", "σθ(E1 × E2) ≡ E1 ⋈θ E2", "turn a product into a join"],
      ["5", "E1 ⋈θ E2 ≡ E2 ⋈θ E1", "join commutativity"],
      ["6", "(E1 ⋈ E2) ⋈ E3 ≡ E1 ⋈ (E2 ⋈ E3)", "join associativity: join order"],
      ["7", "σθ0(E1 ⋈θ E2) ≡ (σθ0(E1)) ⋈θ E2, if θ0 uses only attributes of E1", "push selections down"],
      ["8", "ΠL1∪L2(E1 ⋈θ E2) ≡ ΠL1(E1) ⋈θ ΠL2(E2), if θ uses only L1 ∪ L2", "push projections down"],
    ], caption: "Numbering follows DSC §16.2.1; see the textbook for the full list (set operations, aggregation, outer joins).", size: 13 },
    { t: "bullets", title: "Join ordering", bullets: [
      "Associativity and commutativity give many join orders for the same query",
      "For n relations there are (2(n − 1))! / (n − 1)! different join orders",
      { t: "n = 5: 1,680;   n = 7: 665,280;   n = 10: more than 17.6 billion", sub: true },
      "An optimizer cannot enumerate them all; DSC §16.4 (optional) shows dynamic programming, which reduces the work to O(3ⁿ) for the best order",
      "Heuristics restrict the search, e.g. considering only left-deep join trees",
    ], card: { head: "Link to CQ9.3", body: "Why does the number of join orders grow so quickly, and why can the optimizer not simply try them all?" } },
    { t: "code", title: "Reading execution plans in SQL Server", side: "What to look for", code:
"set statistics io on;     -- logical and physical reads\nset statistics time on;   -- CPU and elapsed time\n\nselect s.name, t.course_id\nfrom   student s join takes t on s.ID = t.ID\nwhere  s.dept_name = 'History';\n\n-- SSMS: Display Estimated Execution Plan (Ctrl+L)\n--       Include Actual Execution Plan    (Ctrl+M)",
      bullets: ["Read the graphical plan from right to left: data flows towards the select operator", "Access operators: Table Scan, Clustered Index Scan, Index Seek, Key Lookup", "Join operators: Nested Loops, Merge Join, Hash Match", "Compare estimated and actual number of rows: large gaps point to wrong estimates (CQ9.1)", "Lab 5 part 1 uses these tools"] },
    { t: "cq", code: "CQ9.1", question: "The optimizer relies on estimates. What happens when the estimates are wrong, and where do the errors come from?",
      prompts: ["Statistics that are out of date", "Independence assumptions between attributes", "How do errors propagate through several joins?"], where: ["Self-study: DSC §16.3", "Leis et al., How good are query optimizers, really? PVLDB 9(3), 2015"] },
    { t: "cq", code: "CQ9.2", question: "The same query can often be written with a join, a subquery or a set operation. Should the choice affect performance? Why or why not?",
      prompts: ["What does the optimizer see after translation?", "Which rewrites must the optimizer know (e.g. decorrelation)?", "Test it: compare the plans in SQL Server"], where: ["DSC §16.2; §16.4 (nested subqueries, optional)", "Chapter 3: equivalent formulations"] },
    { t: "cq", code: "CQ9.3", question: "Why does the number of possible join orders grow so quickly, and why can an optimizer not simply try them all?",
      prompts: ["Count the join orders for n = 3, 4, 5", "What does dynamic programming save?", "What is lost by considering only left-deep trees?"], where: ["Optional: DSC §16.4", "Selinger et al., Access path selection in a relational DBMS, SIGMOD 1979"] },
    { t: "summary", points: [
      "Query processing: parse and translate, optimize, evaluate",
      "Cost measured in block transfers and seeks",
      "Selection by scan or by index; external sort-merge",
      "Join algorithms differ by orders of magnitude in cost",
      "Equivalence rules generate alternative plans; join order matters most",
      "SQL Server execution plans show the chosen algorithms",
    ], next: [
      "Choose one of CQ9.1–CQ9.3 and submit an answer within one week",
      "Self-study: §15.6–15.7 and §16.3; optional §16.4",
      "Session 48: Lab 5 part 1 (indexes and execution plans)",
    ] },
  ],
};

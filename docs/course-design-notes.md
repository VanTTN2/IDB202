# IDB201 – Course Design Notes

This note records the design decisions for IDB201. It answers two questions from the program leadership:

1. Which content is **core for Computer Science (CS)** students, compared with other majors?
2. How should the syllabus, materials, labs, and assignments lean towards **research** rather than application?

---

## 1. Context

| Item | Value |
|---|---|
| Program | Bachelor of Computer Science, specialization in AI and Data Science (BCS_AD), K22A |
| Learners | **Talented-student (honors) classes**: first-year, semester-1 students selected for strong academic ability, with an **academic rather than applied orientation**. No prior database background |
| Concurrent courses | MAD102 Discrete Mathematics, PFP191 Programming Fundamentals with Python, ICS102 Introduction to Computer Systems, CAL111 Calculus I |
| Later courses that build on IDB201 | CSD203 (S2), DSI201 Data Science (S3), DAM311 Data Mining (S4), DPY391 Data Security and Privacy (S5), MLO401 Machine Learning Operations (S8) |
| Official course description (Appendix 2(d)) | ER model, relational data model, functional dependencies and normalization, relational algebra, SQL, **indexing, query optimization, transaction management**; "understand the internal mechanisms of storage and transaction control" |

---

## 2. What is core for CS students, compared with other majors

A database course serves different purposes in different programs.

| Major | Main question the course answers | Typical emphasis |
|---|---|---|
| Information Systems, Business, Accounting | *How do I use a database to support an organization?* | Requirements, ER modeling, SQL for reporting, BI tools |
| Software Engineering | *How do I build applications on top of a DBMS?* | SQL, stored procedures, triggers, ORM, application integration, schema migration |
| Information Assurance | *How do I protect data?* | Access control, auditing, SQL injection, encryption |
| **Computer Science** | ***Why* does the relational approach work, and *how* does a DBMS work inside?** | **Formal foundations, algorithms, complexity, correctness, and system internals** |

### 2.1 Core content for CS (must be taught in depth)

| # | Topic | Why it is core for CS | Where it appears in IDB201 |
|---|---|---|---|
| C1 | **The relational model as mathematics:** relations as sets of tuples, keys, constraints as logical statements | Links directly to MAD102 (sets, relations, logic). This is the theory that makes declarative querying possible. | Ch. 3 |
| C2 | **Formal query languages:** relational algebra, relational calculus, their equivalence (Codd's theorem), and the limits of their expressive power (no transitive closure) | Query languages are a CS topic in their own right: syntax, semantics, expressive power, and translation between languages. | Ch. 4 (+ §4.10 relational calculus) |
| C3 | **Semantics of SQL:** bag semantics, three-valued logic with `NULL`, translation from SQL to algebra | Explains *why* queries return what they return, instead of only how to write them. | Ch. 6 |
| C4 | **Dependency theory:** FDs, Armstrong's axioms (soundness and completeness), closure algorithms, candidate keys, minimal cover, normal forms, lossless join (the chase), dependency preservation | A small, complete axiomatic theory with algorithms and proofs. It is the most "theoretical CS" part of the course. | Ch. 8 |
| C5 | **Storage and indexing:** the I/O cost model, B+-trees (height ≈ log_F N), hashing, clustered versus non-clustered indexes | Algorithms and data structures analyzed under an external-memory cost model. Links to ICS102 and CSD203. | Ch. 9 |
| C6 | **Query processing and optimization:** algebraic equivalences, join algorithms and their costs, cardinality estimation, join ordering (System R dynamic programming) | A classic CS problem: search over a plan space with a cost model. It is also an active research area (learned optimizers). | Ch. 9 |
| C7 | **Transaction theory:** schedules, conflict serializability and precedence graphs, two-phase locking (and why it is correct), recoverability, isolation anomalies, snapshot isolation and write skew, write-ahead logging | Concurrency and correctness are central CS concerns, and the theory comes with proofs. | Ch. 10 |

### 2.2 Shared content (taught to every major, but CS goes deeper)

- **ER modeling** (Ch. 2): every major needs it. CS students should also discuss its *limits* (what ER cannot express) and compare design alternatives.
- **SQL** (Ch. 5–7): every major needs it. CS students should also know its semantics (C3) and how it is executed (C6).

### 2.3 Content to de-emphasize for CS (application-oriented)

| Topic | Decision |
|---|---|
| Stored procedures, functions, triggers (T-SQL programming) | Moved to **optional Appendix A**. Not assessed. |
| DBMS administration: backups, logins, jobs | Mentioned briefly only (Ch. 5 §5.9, Ch. 10 §10.10) |
| Tool-specific skills (SSMS menus, GUI designers) | Kept to what the labs need |
| Front-end or ORM application development | Not covered. SE-track courses cover it |

---

## 3. Research orientation: design principles

For first-year S1 students, "research-oriented" does **not** mean publishing papers. It means building the habits of a researcher:

1. **Ask why, not only how.** Every chapter explains the principle behind a technique and its limits.
2. **Prove and reason formally.** Short proofs (Armstrong's axioms, lossless-join tests, serializability) instead of only computing answers.
3. **Implement algorithms from the theory.** Students implement the core algorithms in Python (closure, keys, BCNF decomposition, a precedence-graph serializability test, a mini relational algebra evaluator). This connects to PFP191, which they take in the same semester.
4. **Experiment and measure.** Form a hypothesis, design an experiment, measure it (execution plans, logical reads, timings), and interpret the results. Report negative results too.
5. **Read primary sources.** Each chapter has a *Research Corner* with one seminal paper and guiding questions.
6. **Write like a researcher.** Assignments are written as short technical reports or papers (IEEE two-column template), with citations, method, results, and threats to validity.
7. **Keep it reproducible.** Code, data-generation scripts, and measurements go in a repository so that someone else can rerun them.

### Calibrating rigor for talented first-year students

These classes are made up of selected, academically strong students, so the course aims **above** a standard first-year database course. Rigor is raised in two ways, and the fact that the students are in semester 1 is taken into account:

| Aspect | Standard class | IDB201 honors classes |
|---|---|---|
| Proofs | Recognize and apply rules | **Write** short proofs: soundness of Armstrong's axioms, the lossless-join test, correctness of 2PL, equivalence rules |
| Algorithms | Run them by hand | Run by hand, **implement in Python**, and argue correctness and complexity |
| Query languages | Relational algebra | Relational algebra **and** relational calculus, with expressive-power arguments (why transitive closure needs recursion) |
| Experiments | Follow the given steps | Given steps in Assignment 1; **own hypothesis and design** in Assignment 2 |
| Readings | Textbook | Textbook **plus** one seminal paper per chapter, discussed in class |
| Exams | Recall and apply | Apply, **analyze, and justify** (at least 30% of final-exam items at the Analyze level or above) |

Things that remain in place because the students are in semester 1:

- The Python tasks use only core language features that PFP191 covers early (lists, sets, dictionaries, functions). Starter code with tests is provided.
- Papers come with guiding questions, and students are not expected to follow every technical detail.
- Proofs are introduced with a worked example first. MAD102 (Discrete Mathematics, same semester) teaches proof techniques, and the chapters point to it.
- Every research task has a *minimum* version that every student can complete and an *extension* for the strongest students.

---

## 4. Seminal readings (Research Corner)

| Chapter | Paper | Guiding focus |
|---|---|---|
| 1 | Stonebraker, M. and Hellerstein, J. M. "What Goes Around Comes Around." In *Readings in Database Systems*, 4th ed., MIT Press, 2005. Also: Stonebraker, M. and Pavlo, A. "What Goes Around Comes Around… And Around…" *ACM SIGMOD Record* 53(2), 2024. | Why do data models keep returning to the relational model? |
| 2 | Chen, P. P. "The Entity-Relationship Model—Toward a Unified View of Data." *ACM TODS* 1(1), 1976. | What problem did Chen want to solve? |
| 3 | Codd, E. F. "A Relational Model of Data for Large Shared Data Banks." *Communications of the ACM* 13(6), 1970. | What is "data independence" in Codd's paper? |
| 4 | Codd, E. F. "Relational Completeness of Data Base Sublanguages." In *Data Base Systems*, Prentice-Hall, 1972. | What does it mean for a language to be "relationally complete"? |
| 6 | Chamberlin, D. D. and Boyce, R. F. "SEQUEL: A Structured English Query Language." *ACM SIGFIDET Workshop*, 1974. | Which design goals of SEQUEL can you still see in SQL? |
| 8 | Armstrong, W. W. "Dependency Structures of Data Base Relationships." *IFIP Congress*, 1974. Also: Codd, E. F. "Further Normalization of the Data Base Relational Model," 1972. | Why are the axioms sound and complete? |
| 9 | Bayer, R. and McCreight, E. "Organization and Maintenance of Large Ordered Indexes." *Acta Informatica* 1, 1972. Selinger, P. G. et al. "Access Path Selection in a Relational Database Management System." *SIGMOD*, 1979. Kraska, T. et al. "The Case for Learned Index Structures." *SIGMOD*, 2018. | Why a B-tree and not a binary tree? How does a cost model guide the choice of plan? Can machine learning replace an index? |
| 10 | Eswaran, K. P. et al. "The Notions of Consistency and Predicate Locks in a Database System." *CACM* 19(11), 1976. Berenson, H. et al. "A Critique of ANSI SQL Isolation Levels." *SIGMOD*, 1995. | Why does two-phase locking give serializability? Why are the ANSI isolation levels ambiguous? |

**Connection to the AI and Data Science track:** learned indexes and learned query optimization (Ch. 9), vector similarity search, and data management for machine learning are active research areas where databases meet AI. They are introduced as Research Corner extensions and as optional topics for Assignment 2.

---

## 5. How the materials implement these decisions

| Component | Research-oriented change |
|---|---|
| Syllabus | CLOs rewritten to include proof, algorithm implementation, and experimental investigation. Assignments replace the application-style group project. |
| Lectures | Each chapter ends with a **Research Corner**. Ch. 4 adds relational calculus and expressive power. Ch. 8 adds proofs. Ch. 9 adds cost formulas. Ch. 10 adds recoverability and snapshot-isolation anomalies. |
| Labs | Each lab has an **Investigate** part (hypothesis → experiment → evidence). Labs 3, 7, and 8 include Python implementations of the theory. |
| Assignments | **Assignment 1:** a guided technical report on design and theory. **Assignment 2:** a mini research project, either empirical or algorithmic, written as a short paper. |
| Constructivist questions | Open "why" and "what if" questions for each session, e.g. "What would break if relations allowed duplicate tuples?" |
| Assessment | The practical exam still checks SQL fluency, which later courses need. The final exam includes reasoning questions, not only recall. |

---

## 6. Open items for the course owner

- [x] **Course code:** confirmed as **IDB201**, as in the curriculum (Appendix 2(a), 2(d)).
- [x] **PLO mapping:** done with the 13 BCS_AD PLOs (see the CLO sheet of the syllabus and §4.7–4.9 of the council brief).
- The decision number and approval date are left blank on purpose: this syllabus is a draft for council review, not the issued version.
- [ ] Confirm that the research-oriented assessment (two report-style assignments) is acceptable under the campus's Course Implementation Plan.

# IDB201 – Project Context and Phase-1 Record

This document records everything decided in phase 1 (syllabus development), so that later phases can continue without losing context. The newest state always wins over older statements in this file. Update the file at the end of every working session.

---

## 1. Course and program facts

| Item | Value | Source |
|---|---|---|
| Course | IDB201 – Introduction to Databases (Giới thiệu về cơ sở dữ liệu) | Curriculum Appendix 2(a), 2(d); confirmed by the user |
| Program | Bachelor of Computer Science, specialization in AI and Data Science (BCS_AD) | `docs/sources/Phuluc_2_BCS_AD_Final.xlsx` |
| Cohort | K22A onward (Decision 1502/QĐ-ĐHFPT, 31/12/2025, for the curriculum) | Same file |
| Semester | S1 (Year 1, Semester 1) | Sheet "Phan bố theo HK - EN" |
| Credits | 3 | User |
| Prerequisite | None | Sheet "Mô tả các học phần" |
| Learners | Talented-student (honors) classes, academic orientation | User |
| Official description | ER model, relational data model, FDs and normalization, relational algebra, SQL, indexing, query optimization, transaction management. Outcomes: design normalized schemas, query proficiently with SQL, understand the internal mechanisms of storage and transaction control | Sheet "Mô tả các học phần", row IDB201 |
| Textbooks | [DSC] Silberschatz et al., 7th ed., 2020; [DMS] Ramakrishnan & Gehrke, 3rd ed., 2003 | User (also listed in the curriculum) |
| Language | Content in English; the user is addressed in Vietnamese | User |

### Program map (courses by semester, from the curriculum)

| Sem. | Courses |
|---|---|
| S0 | OTP101, PE, Preparation English, traditional instrument |
| **S1** | MAD102 Discrete Mathematics, CAL111 Calculus I, ICS102 Introduction to Computer Systems, PFP191 Programming Fundamentals with Python, **IDB201**, PE |
| S2 | QTC211 Quantum Computing, CAL121 Calculus II, MLT201 Matrices & Linear Transformations, CSD203 DSA with Python, IPY111 Introduction to Probability, PE |
| S3 | AIL303m Machine Learning, CVO201 Convex Optimization, DSI201 Data Science, PSI221 Probability & Statistical Inference, JPD113 |
| S4 | DPL302m Deep Learning, QTM321 Quantum ML, DAM311 Data Mining, CVI301 Computer Vision, JPD123 |
| S5 | Combo 1 (e.g. DVI301), DPY391 Data Security & Privacy, NLP401, DAM321 Data Mining Project, ENW493c Research Methods & Academic Writing |
| S6 | OJT202 On-the-Job Training, ITE303c Ethics in IT |
| S7 | Combo 2 (e.g. MLD301), GAI401 Generative AI, AMA401 Advanced Methods for Data Analysis, EXE101 |
| S8 | Combo 3/4 (e.g. BDI302c Big Data, MMP301), MLO401 ML Operations, EXE201, MLN111, MLN122 |
| S9 | ADP490 Capstone or EXE402 Startup Project, MLN131, HCM202, VNR202 |

IDB201 is the entry point of the program skill set "Data Handling, Databases and Data Mining" (Appendix 2(e)).

---

## 2. Decisions made in phase 1

| # | Decision | Reason / origin |
|---|---|---|
| D1 | All project content in English | User |
| D2 | Course code **IDB201**, not IDB202 (the repository keeps the name IDB202) | User confirmed the curriculum code |
| D3 | Academic, research-oriented design for honors students | Program leadership, via the user |
| D4 | CS-core emphasis: formal foundations, query languages, SQL semantics, dependency theory, storage and indexing, query optimization, transaction theory. Application topics (stored procedures, triggers, administration) de-emphasized; procedures and triggers moved to an optional appendix | `docs/course-design-notes.md` §2 |
| D5 | DBMS: Microsoft SQL Server (T-SQL); Python via pyodbc and pandas; Python implementations of the algorithms | Fits PFP191 in the same semester; FPT practice |
| D6 | Time allocation follows the template: 45h contact = **60 sessions × 45 minutes**, plus 1h final exam and 104h self-study | Template |
| D7 | **Assessment:** research labs 10%, progress tests 2 × 10%, Assignment 1 (individual technical report) 10%, Assignment 2 (group mini research project, IEEE paper) 20%, practical exam 10%, final exam 30%. Completion: every on-going component > 0, PE > 0, FE ≥ 4, total ≥ 5 | Proposed by Claude, requested by the user. Template standard was Asm 20 / PT 20 / PE 30 / FE 30 |
| D8 | **8 CLOs** (one per template row); 6 of 8 at Analyze level or above; CLO8 is the research outcome | See §3 |
| D9 | CLO–PLO mapping to the 13 BCS_AD PLOs: PLO2, PLO5, PLO7, PLO8, PLO9, PLO10, PLO11. PLO1, PLO3, PLO4, PLO6, PLO12 and PLO13 are not claimed | See §4 |
| D10 | Each chapter has a "Research Corner" (seminal paper + guiding questions); each lab has an "Investigate" part; 33 constructivist questions | Research orientation |
| D11 | The syllabus is a **draft for council review**; decision number and approval date left blank on purpose | User |
| D12 | **Phase gate:** no detailed lecture content or labs until the council approves the syllabus | User |
| D13 | The user allows Claude to read the user's textbook PDFs when writing materials. PDFs are uploaded per session, never committed (`docs/sources/textbooks/` is git-ignored). Page numbers for the syllabus schedule will be taken from them | User |

---

## 3. CLOs (current)

| CLO | Statement (short) | Bloom | Chapters |
|---|---|---|---|
| CLO1 | Explain fundamental DB concepts and relate them to their research origins | Understand | 1 |
| CLO2 | Design a database: ER model → relational schema with precise keys and constraints (including as logic) | Create | 2, 3, 5 |
| CLO3 | Formulate queries in relational algebra and calculus; prove equivalences; explain expressive-power limits | Analyze | 4, 6 |
| CLO4 | Use SQL (and SQL from Python); explain results through SQL semantics (bags, 3VL) | Apply | 5, 6, 7 |
| CLO5 | FD theory: closures, keys, minimal covers, proofs, 3NF/BCNF, lossless join, dependency preservation; implement in Python | Analyze | 8 |
| CLO6 | Evaluate storage, index, join-algorithm and plan choices with I/O cost models and experiments | Evaluate | 9 |
| CLO7 | Analyze serializability and recoverability; justify 2PL, isolation levels, WAL | Analyze | 10 |
| CLO8 | Conduct a small reproducible research study and report it academically | Create | Research Corners, Assignments |

The full wording is in `syllabus/build_syllabus_xlsx.py` (`CLOS`).

CLO–assessment: Labs → CLO2–8; PT1 → CLO1–3; PT2 → CLO4–5; Asm 1 → CLO2, 3, 8; Asm 2 → CLO5–8; PE → CLO4; FE → CLO1–7.

History: a first version had 9 CLOs (ER design and mapping were separate). They were merged into CLO2 so that the CLOs fit the 8 template rows.

## 4. CLO–PLO mapping (BCS_AD, 13 PLOs)

| CLO | PLOs |
|---|---|
| CLO1 | PLO2 |
| CLO2 | PLO2, PLO5 |
| CLO3 | PLO2, PLO5 |
| CLO4 | PLO2, PLO8 |
| CLO5 | PLO2, PLO5, PLO8 |
| CLO6 | PLO2, PLO5, PLO9 |
| CLO7 | PLO2 |
| CLO8 | PLO5, PLO7, PLO10, PLO11 |

The PLO texts (Vietnamese, official) are in `docs/sources/BCS_AD_13_PLO.xlsx`. The rationale for each link is in the council brief, §4.8–4.9.

---

## 5. Chapter structure (from the syllabus schedule)

| Ch. | Topic | Sessions |
|---|---|---|
| 1 | Introduction to database systems | 1–3 |
| 2 | Entity–Relationship model | 4–8 |
| 3 | Relational model and ER-to-relational mapping | 9–13 |
| 4 | Relational algebra and calculus | 14–18; Progress test 1 in 19 |
| 5 | SQL: data definition and constraints | 20–24 |
| 6 | SQL: queries and semantics | 25–33 |
| 7 | Data modification, views, SQL from Python | 34–37; Assignment 1 defense in 38 |
| 8 | Functional dependencies and normalization | 39–45; Progress test 2 in 46 |
| 9 | Storage, indexing and query processing | 47–51 |
| 10 | Transactions, concurrency, recovery | 52–56 |
| – | Assignment 2 progress (57), presentations (58–59), review (60) | 57–60 |
| App. A | Stored procedures, functions, triggers (optional, not assessed) | – |

---

## 6. Phases and next steps

| Phase | Content | Status |
|---|---|---|
| 1 | Syllabus (xlsx in the template), council brief (docx), design notes | **Done – awaiting council review** |
| 1b | Revise the syllabus after council feedback; add page references from the textbooks' tables of contents | Next: wait for the council feedback and the textbook PDFs (DSC first, DMS later) |
| 2 | Detailed lecture notes per chapter (revise the drafts in `lectures/`) | Not started (drafts exist, on hold) |
| 3 | Slides per chapter | Not started |
| 4 | Labs with Investigate parts, starter code and solutions (revise the drafts in `labs/`) | Not started (drafts exist, on hold) |
| 5 | Assignment 1 and 2 briefs and rubrics; research topic list | Not started |
| 6 | Question bank: progress tests, practical exam, final exam (≥ 30% analysis-level items) | Not started |

**When phase 2 starts,** re-check the drafts against the approved syllabus: CLO numbers, session mapping, chapter 9 on storage and query processing, the Research Corner content, and chapter 7's Python section. The drafts already use the 8-CLO numbering and the course code IDB201.

---

## 7. Inventory of existing drafts (phase-2 material written before the pause)

- `lectures/ch01…ch10-*.md`, `lectures/appendix-a-procedures-triggers.md`: lecture notes with Research Corners and advanced theory sections.
- `labs/lab01…lab08-*.md`: lab handouts. `labs/database/university.sql`: the UniversityDB sample database, tested on SQL Server 2022.
- `labs/solutions/`: lab04 and lab05 SQL solutions (tested); Python reference solutions `fd.py`, `ra.py`, `schedule.py` with tests in `labs/python/tests/` (14 tests pass).
- Not yet written: solutions for labs 2, 3, 6, 7 and 8 (they are referenced in the handouts), Python starter files, slides, question bank, assignment briefs.

---

## 8. Session log

| Date | Work |
|---|---|
| 2026-09-24 | Phase 1. Collected requirements (English content, 3 credits, honors S1 CS students, research orientation, textbooks DSC and DMS). Read the curriculum and PLO files and the syllabus template. Produced the syllabus workbook (60 sessions, 8 CLOs, CQs, grading), the council brief docx, and the design notes. Confirmed course code IDB201. Mapped CLOs to 13 PLOs. Early drafts of lectures and labs were written, then put on hold at the user's request. All work pushed to branch `claude/relaxed-tesla-1t3tl7`. |

# IDB201 – Project Context and Phase-1 Record

This document records everything decided in phase 1 (syllabus development), so that later phases can continue without losing context. The newest state always wins over older statements in this file. Update the file at the end of every working session.

---

## 0. Where we are now (snapshot, 2026-10-14)

- **Phase 1 is finished and waiting for the council.** The syllabus and the brief are up to date and consistent:
  `syllabus/IDB201_Syllabus.xlsx`, `docs/IDB201_Academic_Emphasis_Brief.docx`. `docs/IDB201_DSC_Reading_Plan.xlsx` predates the 2026-10-14 T-SQL change and still marks §5.2–5.3 optional.
- **Syllabus structure:** 60 sessions × 45 min following DSC 7th ed. chapter order (C1–C10, see §5), each session citing DSC sections and pages; guided self-study for abstract, hard-to-experiment parts (online Ch. 27 relational calculus, §16.3, §16.4 optional, most of Ch. 19, and others). Since 2026-10-14: C5 is T-SQL programming (sessions 20–25) and the internals chapters C8–C10 have 14 sessions instead of 20.
- **Description (C12):** the short objectives list in `docs/course-introduction.md` (formal foundations, algorithms, complexity, correctness, system internals).
- **CLOs:** 8; CLO4 extended with T-SQL programming on 2026-10-14; CLO–PLO mapping to the 13 BCS_AD PLOs (§4).
- **Assessment (revised 2026-10-13):** Labs and constructivist questions 10% (5 labs 6% + 9 CQ answers 4%), PT1 5% (C1–C5), PT2 5% (C6–C7), Assignment (one group project) 30%, FE 50%. **No practical exam.** Completion: every on-going component > 0, FE ≥ 5, total ≥ 5.
- **Labs (5, SQL/T-SQL only, 8 sessions):** Lab 1 SQL queries (13–14), Lab 2 DDL/constraints/views/parameterized queries (19), Lab 3 T-SQL functions, procedures, triggers, cursors (24–25), Lab 4 E-R design (31), Lab 5 indexing and query plans (48) + concurrency (53). Relational algebra (session 8), FD theory (38) and B+-tree/I/O cost (44) are guided exercise sessions on paper.
- **Self-study (not taught in class):** bag semantics of SQL (C3, worksheet); Python (database access with pyodbc/pandas, Python versions of the algorithms) is optional self-study and not required in the labs.
- **Research practice:** 27 constructivist questions (3 per chapter for 9 chapters, discussed in sessions 3, 8, 12, 18, 30, 37, 44, 47, 54; the T-SQL chapter C5 has none, by the user's decision of 2026-10-14); each student answers one per chapter (short answer; the 150–200-word limit was removed by the user). Group project: introduced in session 7, design review in 39, progress meeting in 55, presentations in 56–57. No Research Corner and no papers in Materials (removed at the user's request to avoid overload).
- **Materials:** DSC (main), DMS (secondary), T-SQL reference.
- **Waiting for:** the council's feedback on the syllabus. The DSC PDF will be uploaded by the user when content work (phase 2) starts.

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
| D4 | CS-core emphasis: formal foundations, query languages, SQL semantics, dependency theory, storage and indexing, query optimization, transaction theory. Administration de-emphasized. **T-SQL programming (functions, stored procedures, triggers, cursors) is a taught chapter C5 (sessions 20–25, Lab 3) since 2026-10-14**; its time came from trimming storage, query processing and transactions | `docs/course-design-notes.md` §2; user (2026-10-14) |
| D5 | DBMS: Microsoft SQL Server (T-SQL). **Python is optional self-study only** (since 2026-10-13): not taught in class, not required in labs | User (2026-10-13); earlier version used Python in labs |
| D6 | Time allocation follows the template: 45h contact = **60 sessions × 45 minutes**, plus 1h final exam and 104h self-study | Template |
| D7 | **Assessment (revised 2026-10-13):** labs and CQ answers 10% (5 labs), PT1 5%, PT2 5%, one Assignment (group project, academic report) 30%, final exam 50%; no practical exam. Completion: every on-going component > 0, FE ≥ 5, total ≥ 5 | User (2026-10-13): FE must be 50%; labs 9 → 5; two assignments → one group project; PE removed. The PT 5%/5% and project 30% split comes from the user's own edit of the Note cell and was confirmed by the user on 2026-10-13. Template standard was Asm 20 / PT 20 / PE 30 / FE 30 |
| D8 | **8 CLOs** (one per template row); 6 of 8 at Analyze level or above; CLO8 is the research outcome | See §3 |
| D9 | CLO–PLO mapping to the 13 BCS_AD PLOs: PLO2, PLO5, PLO7, PLO8, PLO9, PLO10, PLO11. PLO1, PLO3, PLO4, PLO6, PLO12 and PLO13 are not claimed | See §4 |
| D10 | Research practice: 27 constructivist questions (3 per chapter, discussed in 9 sessions; none for the T-SQL chapter C5, which is a skills chapter — user, 2026-10-14); each student answers one per chapter in 150–200 words, graded 4% inside the "Labs and constructivist questions" component (labs 6%). The earlier "Research Corner" paper readings were removed at the user's request (2026-09-27) to avoid overload; Materials keep only DSC, DMS and the T-SQL reference | User / Claude |
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
| CLO4 | Use SQL; explain results through SQL semantics (3VL; bags as self-study) | Apply | 5, 6, 7 |
| CLO5 | FD theory: closures, keys, minimal covers, proofs, 3NF/BCNF, lossless join, dependency preservation | Analyze | 8 |
| CLO6 | Evaluate storage, index, join-algorithm and plan choices with I/O cost models and experiments | Evaluate | 9 |
| CLO7 | Analyze serializability and recoverability; justify 2PL, isolation levels, WAL | Analyze | 10 |
| CLO8 | Conduct a small reproducible research study and report it academically | Create | CQs, group project |

The full wording is in `syllabus/build_syllabus_xlsx.py` (`CLOS`).

CLO–assessment: Labs & CQ → CLO1–8; PT1 → CLO1–4; PT2 → CLO2, CLO5; Assignment (group project) → CLO2, 3, 5, 6, 7, 8; FE → CLO1–7.

Wording changes of 2026-10-13 (from the user's edits): CLO4 no longer mentions Python (bag semantics through guided self-study); CLO5 drops "implement these algorithms in Python"; CLO8 reports in an "academic report" instead of a paper.

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

## 5. Chapter structure (DSC-based, current)

Since 2026-09-27 the course follows the chapter order of [DSC] (Database System Concepts, 7th ed.). Every session cites sections and pages. Abstract, hard-to-experiment material is guided self-study.

| Course ch. | Topic | DSC | Sessions |
|---|---|---|---|
| C1 | Introduction | Ch. 1 | 1–3 (tool set-up, not graded, in 3) |
| C2 | Relational model and relational algebra | Ch. 2; online Ch. 27 (relational calculus) = self-study | 4–8 (group project introduction in 7; algebra exercises and worksheet review in 8) |
| C3 | Introduction to SQL | Ch. 3 (bag semantics = self-study) | 9–14 (Lab 1 in 13–14) |
| C4 | Intermediate and advanced SQL | Ch. 4, §5.1, §5.4 | 15–19 (Lab 2 in 19) |
| C5 | Programming the server in T-SQL (functions, procedures, triggers, cursors) | §5.2–5.3; T-SQL reference | 20–25 (Lab 3 in 24–25); Progress test 1 in 26 |
| C6 | E-R model | Ch. 6 | 27–31 (Lab 4 in 31) |
| C7 | Relational database design | Ch. 7 | 32–38 (FD guided exercises in 38); project design review in 39; Progress test 2 in 40 |
| C8 | Storage and indexing | Ch. 12 (self-study), 13, 14 | 41–44 (guided exercises in 44) |
| C9 | Query processing and optimization | Ch. 15, 16 (§16.3 self-study, §16.4 optional) | 45–48 (Lab 5 part 1 in 48) |
| C10 | Transactions, concurrency control and recovery | Ch. 17, 18, 19 (recovery mainly self-study) | 49–54 (Lab 5 part 2 in 53; recovery overview in 54) |
| – | Project progress meeting, presentations; review; final-exam practice | – | 55–60 |

Stored procedures, functions and triggers (DSC §5.2–5.3) are taught in C5 (since 2026-10-14); `docs/IDB201_DSC_Reading_Plan.xlsx` still marks them optional and should be updated when it is next rebuilt. The full per-section classification with page ranges is in `docs/IDB201_DSC_Reading_Plan.xlsx` (built by `docs/build_reading_plan.py`).

Assessment scopes: PT1 = C1–C5 (CLO1–CLO4); PT2 = C6–C7 (CLO2, CLO5); 5 labs (Lab 1 SQL queries, Lab 2 DDL/constraints/views, Lab 3 T-SQL programming, Lab 4 E-R design, Lab 5 indexing/plans + concurrency); no practical exam.

## 6. Phases and next steps

| Phase | Content | Status |
|---|---|---|
| 1 | Syllabus (xlsx in the template), council brief (docx), design notes | **Done – awaiting council review** |
| 1b | Revise the syllabus after council feedback | DSC page references **done** (2026-09-27). Next: wait for the council feedback. DMS is only a secondary reference, so no DMS page references are needed unless the council asks |
| 2 | Detailed lecture notes per chapter (revise the drafts in `lectures/`) | Not started (drafts exist, on hold) |
| 3 | Slides per chapter | Not started |
| 4 | Labs with Investigate parts, starter code and solutions (revise the drafts in `labs/`) | Not started (drafts exist, on hold) |
| 5 | Group-project brief, milestones and rubric; research topic list | Not started |
| 6 | Question bank: progress tests, final exam (≥ 30% analysis-level items) | Not started |

**When phase 2 starts,** the drafts in `lectures/` and `labs/` must be restructured: they still follow the old 10-chapter layout (ER before the relational model, one combined storage/query chapter, 8 labs) and contain Research Corner sections, which were removed. Rebuild them on the DSC-based structure C1–C10 and the 5 SQL-only labs in §5 (Python material becomes optional self-study), cite DSC sections and pages, and drop the Research Corners. They already use the 8-CLO numbering and the course code IDB201.

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
| 2026-09-24 (later) | Stored every uploaded source file in `docs/sources/` (curriculum, PLOs, course-name screenshot, reference links); the template is in `syllabus/template/`. Declined to download the textbooks from the third-party links because of copyright. Agreed that Claude may read the user's own textbook PDFs, uploaded per session and never committed (D13). **Waiting for:** council feedback on the syllabus; the DSC PDF (or its table of contents) and later the DMS PDF. |
| 2026-09-27 | Received the DSC 7th-ed. table of contents (10 screenshots in index.docx; not stored). Built `docs/IDB201_DSC_Reading_Plan.xlsx` (script `docs/build_reading_plan.py`): in class / self-study / optional / later-course decision for every chapter and section with page ranges, plus a session-load analysis. Finding: IDB201 Ch. 9 (DSC 13–16, about 121 in-class pages) has only 4 theory sessions; proposed moving 2 sessions from SQL to Ch. 9 (pending the user's decision). Wrote a ~110-word course introduction (`docs/course-introduction.md`). |
| 2026-09-27 | Replaced the syllabus Description (sheet "Syllabus", C12) with the short list of course objectives chosen by the user (`docs/course-introduction.md`). Pending decision: move 2 sessions from SQL to Ch. 9 and add page numbers to the schedule. |
| 2026-09-27 | Rebuilt the whole syllabus on the chapter order of DSC 7th ed. (the user re-sent the same table of contents). 60 sessions with section and page citations; 9 labs; guided self-study for abstract, hard-to-experiment parts (online Ch. 27 relational calculus, §16.3, most of Ch. 19, and others). Updated the grading scopes, materials (DSC main, DMS secondary), constructivist questions (30), the reading plan and the council brief (chapter table, new §3.2 self-study, CLO coverage and matrix, labs, alignment). |
| 2026-09-27 | Removed the Research Corner (it was Claude's own proposal, not from any source). Replaced it with graded constructivist-question answers (one per chapter, 150–200 words, 4%), merged with labs (6%) into one 10% component. Removed the papers from Materials. Lightened per-session tasks. Updated the objective "read research papers" to "answer research-style questions". Council brief updated accordingly. |
| 2026-09-27 | Rewrote the short course objectives in `docs/course-introduction.md` to highlight formal foundations, algorithms, complexity, correctness and system internals. Saved for later use. |
| 2026-09-27 | Placed the rewritten objectives (`docs/course-introduction.md`) into the syllabus Description (sheet "Syllabus", C12) at the user's request. |
| 2026-09-27 (end of day) | Session wrap-up: added the snapshot (§0), marked DSC page references as done in §6, and noted that the lecture/lab drafts must be restructured to the DSC-based layout in phase 2. The earlier pending decision about moving 2 SQL sessions is superseded by the DSC-based rebuild. All work pushed to `claude/relaxed-tesla-1t3tl7`. |
| 2026-10-13 | The user uploaded an edited syllabus workbook and asked for six changes. Merged the user's own edits (shorter Program line, Pre-requisite, Description capitalization, Student's tasks, Tools, CLO4/CLO5/CLO8 wording, FE minimum 5, no word limit on CQ answers, project introduction session) into `build_syllabus_xlsx.py`, then: labs 9 → 5 (SQL only); Assignments 1 and 2 → one group project (introduced in 7, design review in 33, progress meeting in 55, presentations in 56–57); practical exam removed (session 60 is now final-exam practice); FE 50% and on-going 50% (labs & CQ 10, PT1 5, PT2 5, project 30); bag semantics → guided self-study (CQ3 of session 12 replaced); Python → optional self-study. Updated the council brief, the reading plan notes and this file. |
| 2026-10-14 | The user compared IDB201 with the DBI202 FA26 syllabus and asked to trim storage/indexing, query processing and transactions to make room for T-SQL programming, keeping 60 sessions, 5 labs, 2 progress tests and one project. New chapter C5 (sessions 20–25: functions, procedures, triggers, cursors; Lab 3 in two parts). Internals trimmed from 20 to 14 sessions: C8 storage/indexing 4, C9 query processing 4 (DP join ordering → optional self-study), C10 transactions + recovery 6 (snapshot isolation → overview). Labs renumbered (E-R → Lab 4; indexing + concurrency → Lab 5 in two parts). CLO4 now includes T-SQL programming. CQ sessions: 3, 8, 12, 18, 23, 30, 37, 44, 47, 54 (new T-SQL CQs; transactions and recovery CQs merged). PT1 now in 26 (C1–C5), design review 39, PT2 40. Updated the council brief and design notes. Branch synced from `claude/intelligent-curie-p8mipe` and pushed to `claude/trusting-mccarthy-1jyvtc`. |
| 2026-10-14 (later) | At the user's request, removed the constructivist questions from the T-SQL chapter C5: CQs are kept for the chapters that extend conceptual knowledge. Now 27 CQs in 9 discussion sessions; 9 CQ answers share the 4%. Syllabus, brief and notes updated. |

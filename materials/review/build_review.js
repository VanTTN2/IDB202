// Builds the consistency review of the phase-2 materials (task 6).
// Usage: node materials/review/build_review.js
const path = require("path");
const { P, H1, H2, bullets, numbered, table, box, titleBlock, build } = require(path.join(__dirname, "..", "docx_common.js"));

const OK = "Consistent", NOTE = "Consistent, see note", ISSUE = "Needs a decision";

const children = [
  ...titleBlock("Consistency review of the phase-2 materials", "Slides, labs, group project, progress tests and final-exam bank, checked against the syllabus", [
    ["Date", "24 October 2026"],
    ["Checked against", "Syllabus workbook IDB201_Syllabus.xlsx (sheets Syllabus, CLO, Constructivist Question, Schedule, Grading structure) and the course objectives (docs/course-introduction.md)"],
    ["Materials", "10 slide decks; 5 lab handouts; 1 group-project brief; 2 progress tests; 1 final-exam bank of 400 MCQ"],
  ]),

  H1("1. Method"),
  ...bullets([
    "Every deliverable was compared, item by item, with the sessions of the Schedule sheet, the weights and rules of the Grading structure sheet, the CLO sheet and the 27 constructivist questions.",
    "All SQL in the lab solutions, and every query result, error number and measurement quoted in the lab hints, was run on SQL Server 2022 (Docker image mssql/server:2022-latest) with the scripts in materials/labs/sql.",
    "Practice-based exam items with computed answers were checked with SQL Server (SQL items) or with an attribute-closure script (functional-dependency items).",
    "The DSC PDF was not available in this session. Section and page references follow the reading list of the Schedule sheet; content follows DSC 7th ed. In the question bank, references are given at section level (e.g. §7.4) to avoid wrong subsection numbers.",
  ]),

  H1("2. Summary"),
  ...table([2.6, 2.2, 1.8, 3.2], ["Deliverable", "Checked against", "Result", "Notes"], [
    ["Slides, 10 decks (249 slides)", "Schedule, CQ sheet, CLO", NOTE, "Issues 1–3 below"],
    ["Labs 1–5", "Schedule, Grading row 1, CLO", NOTE, "Issue 4 (session length)"],
    ["Group project", "Grading row 4, Schedule sessions 7, 39, 52, 54, 56–57", OK, "Issue 6 (AI-use statement added)"],
    ["Progress tests 1–2", "Grading rows 2–3, Schedule sessions 26, 40", ISSUE, "Issue 5 (2 written items)"],
    ["Final-exam bank", "Grading row 5, Syllabus", NOTE, "Issue 7 (bank proportions)"],
  ]),

  H1("3. Consistency with the Schedule"),
  ...table([1.6, 1.6, 3.2, 3.2], ["Deck", "Sessions", "Schedule topics covered", "Remarks"], [
    ["chapter_1", "1, 2, 3", "§1.1–1.7; self-study §1.8–1.9; CQ1.1–CQ1.3", "Tool set-up of session 3 is a short slide"],
    ["Chapter_2", "4, 5, 6", "§2.1–2.6; division and aggregation; calculus self-study briefing", "CQ2.1–CQ2.3 (session 8) are not in any deck: see issue 1"],
    ["Chapter_3", "9–12", "§3.1–3.9; SQL → algebra; bag-semantics self-study; CQ3.1–CQ3.3", ""],
    ["Chapter_4", "15, 16, 17", "§4.1–4.6, §5.4; self-study §4.7, §5.5", ""],
    ["Chapter_5", "18–23", "§5.1, SQL injection, CQ4.1–CQ4.3 (session 18); Lab 2 briefing (session 19); §5.2–5.3, cursors", "Session 18 is labelled 'Slides: Chapter 4' in the Schedule: see issue 2"],
    ["Chapter_6", "27–30", "§6.1–6.7, §6.9; self-study §6.8, §6.10–6.11; CQ6.1–CQ6.3", ""],
    ["Chapter_7", "32–37", "§7.1–7.6, §7.8; self-study §7.7, §7.9; CQ7.1–CQ7.3", "Session 38 (guided exercises) was not requested"],
    ["Chapter_8", "41*, 42, 43, 44", "§13.1–13.3, §13.5; §14.1–14.3, §14.5, §14.7; exercises; CQ8.1–CQ8.3", "*Session 41 added: see issue 3"],
    ["Chapter_9", "45, 46, 47", "§15.1–15.5, §16.1–16.2, SQL Server plans; CQ9.1–CQ9.3", ""],
    ["Chapter_10", "49, 50, 51, 53, 55", "§17.1–17.10, §18.1–18.2, §18.4, §18.8, §19.1, §19.3–19.4; CQ10.1–CQ10.3", ""],
  ]),
  ...table([1.4, 1.6, 2.2, 2.2, 2.2], ["Lab", "Sessions", "Schedule content", "Handout content", "CLOs (Schedule = handout)"], [
    ["Lab 1", "13, 14", "Queries, joins, NULL; aggregation, subqueries, set operations, equivalent formulations", "Parts A and B; Investigate on equivalent formulations with nulls", "CLO3, CLO4"],
    ["Lab 2", "19", "DDL, constraints, views, parameterized queries", "Constraints, views, cascades; Investigate on SQL injection", "CLO2, CLO4"],
    ["Lab 3", "24, 25", "UDFs, procedures, error handling; triggers, audit logs; cursor vs set-based (Investigate)", "Same", "CLO2, CLO4, CLO8"],
    ["Lab 4", "31", "E-R design, reduction, implementation", "Clinic database; Investigate on ternary vs binary (CQ6.2)", "CLO2"],
    ["Lab 5", "48, 54", "Indexes and plans (Investigate); concurrency with two sessions, precedence graphs", "Same; concurrency teams' experiments use the same set-up", "CLO6, CLO7, CLO8"],
  ]),

  H1("4. Consistency with the Grading structure"),
  ...table([2.2, 3.6, 3.8], ["Component", "Grading structure", "Materials"], [
    ["Labs (row 1)", "5 labs, 6% in total (1.2% each); Investigate part ≥ 40% of each lab mark", "Each lab 10 points; Investigate = 4, 4, 4, 4 and 5 points (40–50%). Each rubric states the rule."],
    ["CQ answers (row 1)", "9 answers, 4% in total", "Every deck that hosts a CQ discussion ends with 'choose one and submit within one week'. CQ2 has no slides (issue 1)."],
    ["Progress test 1 (row 2)", "30', 20 MCQ + 2 written; Ch. 1–5 and self-study; CLO1–CLO4", "30', 20 MCQ (10 points); Ch. 1–5 with self-study and CQ1–CQ4 topics; written items not prepared (issue 5)"],
    ["Progress test 2 (row 3)", "30', 20 MCQ + 2 written; Ch. 6–7 and self-study; CLO2, CLO5", "30', 20 MCQ; Ch. 6–7 with self-study and CQ6–CQ7 topics; written items not prepared (issue 5)"],
    ["Group project (row 4)", "Milestone 1 25%, report 40%, reproducibility 10%, presentation 20%, peer 5%; milestones at sessions 7, 39, 52, 56–57; panel of 2 lecturers; individual marks by contribution logs", "Rubric uses exactly these weights (2.5 / 4.0 / 1.0 / 2.0 / 0.5 of 10 points); milestones, panel, contribution log, concurrency-team rule of session 52/54 all included"],
    ["Final exam (row 5)", "50 MCQ, 60', computer-marked; all chapters incl. self-study (~20% of items); ≥ 30% at Analyze level; ≥ 70% change between forms; CLO1–CLO7", "Bank of 400 MCQ with level, CLO, source, practice/theory and self-study tags; guidance for composing forms (issue 7)"],
  ]),

  H1("5. Consistency with the CLOs"),
  ...table([1.0, 1.6, 1.4, 1.6, 1.4, 1.4], ["CLO", "Slides (chapters)", "Labs", "Project", "Progress tests", "Final bank (items)"], [
    ["CLO1", "1", "–", "–", "PT1", "25"],
    ["CLO2", "2, 4, 6", "2, 3, 4", "Milestone 1", "PT2", "42"],
    ["CLO3", "2, 3, 4", "1", "–", "PT1", "40"],
    ["CLO4", "3, 4, 5", "1, 2, 3", "Database part", "PT1", "128"],
    ["CLO5", "7", "–", "Milestone 1", "PT2", "53"],
    ["CLO6", "8, 9", "5", "Research tracks", "–", "72"],
    ["CLO7", "10", "5", "Concurrency track", "–", "40"],
    ["CLO8", "CQs, project briefing", "Investigate parts", "Whole study", "–", "– (not examined, as in the Grading structure)"],
  ]),
  P("Every CLO is taught and assessed. CLO8 is assessed by the labs' Investigate parts, the CQ answers and the project, and not by the final exam, which matches the CLO list of Grading row 5."),

  H1("6. Consistency with the course objectives"),
  ...table([3.2, 6.4], ["Objective", "Where the materials address it"], [
    ["Formal foundations (relations as sets, keys and constraints as logic)", "Chapter_2 deck; PT1 items on superkeys; Lab 1 Investigate on three-valued logic"],
    ["E-R design and conversion to relations", "Chapter_6 deck; Lab 4; project milestone 1; PT2"],
    ["Algebra, calculus, SQL and expressive power", "Chapter_2–4 decks (transitive closure, Codd's theorem); bank items on safety and recursion"],
    ["FD theory, algorithms and proofs", "Chapter_7 deck (soundness proofs, lossless-join proof sketch, algorithms); PT2; bank items on derivations"],
    ["Cost and complexity of storage, indexing, query processing", "Chapter_8–9 decks (height analysis, join cost table, join-order count); Lab 5 part 1"],
    ["Transactions, concurrency control, recovery", "Chapter_10 deck; Lab 5 part 2; bank items on schedules, 2PL, WAL and recovery"],
    ["Research-style questions and small experiments", "27 CQ slides; Investigate parts of all labs; project research study"],
  ]),

  H1("7. Consistency between the tasks"),
  ...bullets([
    "One schema everywhere: the slides, the lab database and most exam items use the DSC university schema (instructor, student, takes, …). The lab data was written for the course; it is not the textbook's data set.",
    "SQL Server specifics are stated the same way in slides, labs and items: no natural join/using, identity(1, 1), with (not with recursive) and union all for recursion, indexed views, read committed as default level, error 1205 for deadlocks.",
    "Lab results match the slide content: e.g. Lab 1's three formulations explain CQ3.2; Lab 4's counterexample is CQ6.2; Lab 5 part 1 reproduces the 'scan beats index' claim of the Chapter_8 exercise and CQ8.2; Lab 5 part 2 reproduces the anomaly table of §17.8.",
    "The progress tests and the final bank do not share items, so the bank can be used without exposing PT questions.",
  ]),

  H1("8. Issues that need a decision"),
  ...numbered([
    "**CQ2.1–CQ2.3 have no slides.** They are discussed in session 8, which was not in the requested list for Chapter_2 (sessions 4–6). Option: add three CQ slides (and an exercise slide for session 8) to Chapter_2.pptx.",
    "**Session 18 is in Chapter_5.pptx** as requested, while the Schedule labels its material 'Slides: Chapter 4'. Option: change the Schedule label to 'Slides: Chapter 5', or move the session-18 slides into Chapter_4.pptx.",
    "**Session 41 (storage) was added to Chapter_8.pptx** because the Schedule assigns 'Slides: Chapter 8' to it but the request listed only sessions 42–44. The five session-41 slides are marked in the speaker notes and can be removed.",
    "**Lab length.** The syllabus gives 45 hours for 60 sessions, i.e. 45 minutes per session. Lab 2 and Lab 4 have one session each, so the handouts ask students to prepare before the session (Lab 4 publishes its requirements one week earlier). Please confirm this practice, or allow submission shortly after the session.",
    "**Progress tests: 2 written items.** The Grading structure specifies '20 MCQ + 2 written' for each progress test (PT1: an algebra/calculus proof or query and an SQL-semantics or T-SQL reasoning item; PT2: an E-R design and reduction task and an FD proof or normalization task). The request asked for 20 MCQ, so the written items were not prepared. Option: add them with a marking guide, or change the Grading structure to 20 MCQ only.",
    "**Project: AI-use statement.** The Grading structure gives 0 for undisclosed AI-generated content. To make this checkable, the brief asks every report to end with a statement of the tools used. Please confirm.",
    "**Bank proportions.** The bank has 83 Analyze items (21%) and 61 self-study items (15%). Each 50-item form needs 15 Analyze and about 10 self-study items, so the bank supports about five forms with no repeated Analyze item. If more forms are needed, the Analyze share of the bank should be raised.",
  ]),

  H1("9. What could not be verified"),
  ...bullets([
    "Page numbers and exact wording of DSC: the PDF was not available. All references to DSC sections follow the syllabus reading list; a check against the PDF is recommended before use, particularly the page numbers on the session slides.",
    "Rendering: the decks and documents passed the Office schema validation, but could not be rendered to images in this environment. A visual check in PowerPoint and Word is recommended (fonts: Cambria, Calibri, Courier New).",
    "Timings in Lab 3 and Lab 5 were measured in one container; lab PCs will give different absolute numbers, but the same orders of magnitude.",
  ]),
];

build(path.join(__dirname, "out", "IDB201_Consistency_Review.docx"), children, { title: "IDB201 Consistency review", header: "IDB201 – Consistency review of phase-2 materials" });

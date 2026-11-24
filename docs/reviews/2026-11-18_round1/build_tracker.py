"""Build the council-feedback verification tracker for IDB201 (review of 18 Nov 2026, round 1)."""
import json
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment, PatternFill, Border, Side
from openpyxl.formatting.rule import FormulaRule
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

F = "Arial"
HDR = PatternFill("solid", fgColor="1F3864")
thin = Side(style="thin", color="BFBFBF")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)
STATUSES = ["Done", "Partly done", "Not done", "Pending decision"]
FILLS = {"Done": "E2EFDA", "Partly done": "FFF2CC", "Not done": "F8CBAD", "Pending decision": "DDEBF7"}

# (ID, form, form row, area, council request, designer's reply (claimed), verified status, evidence in the folder, remaining action)
R = [
# ---------------- BM.09 learning materials ----------------
("M01","BM.09","1.1 (row 6)","Labs – format",
 "Fix the lost underscores in Labs 1, 3, 5 (course_id, sec_id, tot_cred, lab3_scale.sql, student_big …) and check spelling everywhere.",
 "Converter fixed; all labs, project and exercise sheets rebuilt.",
 "Done",
 "No underscore-less names (courseid, secid, totcred, lab3scale, stux, studentbig, takesbig, deptname) in any of the 5 labs, 5 solutions, 4 project files or 13 exercise files.",
 ""),
("M02","BM.09","1.3 (row 8)","Slides – visuals",
 "Add diagrams: DBMS architecture, schema diagram, E-R diagram, B+-tree, hashing, expression tree / execution plan, precedence graph, wait-for graph, transaction state diagram.",
 "16 diagrams drawn with PowerPoint shapes.",
 "Done",
 "16 diagram slides found, each with a source caption: Ch1 s.21, 32; Ch2 s.15; Ch3 s.36; Ch5 s.21; Ch6 s.9; Ch7 s.31; Ch8 s.19, 28; Ch9 s.6, 23, 25, 31; Ch10 s.11, 20, 30. All requested diagram types are present.",
 ""),
("M03","BM.09","1.5 (row 10)","Slides – branding",
 "Add the FPT University logo on the first slide and FPTU brand identity.",
 "Logo on the cover and on every slide; blue–orange FPT colours; official template to replace it when provided.",
 "Done",
 "Logo picture on slide 1 of all 10 decks and in the slide layout (top-right of every slide); orange band at the top of each slide (checked on rendered Ch6 and Ch8).",
 "Replace the logo with the department's official high-resolution template when it is provided."),
("M04","BM.09","1.6 (row 11)","Slides – font sizes",
 "Title 32–44 pt, body 24–28 pt, captions/sources ≥ 18 pt; at most 2 sans-serif font families.",
 "Arial + Courier New only; title 32, body 24 (sub-points 22), tables 20, code 16–18, sources 18.",
 "Partly done",
 "Fonts: only Arial and Courier New in all 10 decks (OK). Titles 32–44 pt, body 24 pt, sources 18 pt (OK). But 94 text runs inside diagrams are 15–16 pt, below the 18 pt minimum: Ch1 21 (s.21, 32), Ch2 46 (schema diagram s.15, 15 pt), Ch5 2, Ch6 4 (E-R diagram s.9), Ch7 2, Ch9 5, Ch10 14 (state diagram s.11). Tables use 20 pt, below the 24 pt body size the form lists.",
 "Raise diagram labels to ≥ 18 pt (enlarge the diagram shapes), or confirm with the reviewer that diagram labels and tables may be smaller."),
("M05","BM.09","1.6 (row 11)","Slides – layout",
 "Many slides put small text in the top half and leave the bottom half empty (Ch6 s.5, 6, 9; Ch8 s.11–14).",
 "Content that does not fit is split automatically, so no slide crowds text in the top half.",
 "Partly done",
 "The crowding is gone, but the automatic split created 63 near-empty '(cont.)' slides with only one or two lines and a mostly empty slide (e.g. Ch8 s.20 'A B+-tree with n = 4 (cont.)' has one bullet; Ch6 s.19, 21; Ch8 s.6, 10, 12). Per deck: Ch1 8, Ch2 9, Ch3 5, Ch4 5, Ch5 4, Ch6 5, Ch7 5, Ch8 9, Ch9 8, Ch10 5. See sheet 'Slide checks'.",
 "Merge each short '(cont.)' slide back or fill it with an example or diagram, so the reviewer does not see the same empty-bottom pattern again."),
("M06","BM.09","2.1 (row 14)","Content level",
 "Content beyond first-semester level (proofs, relational calculus, NP-completeness, ARIES) should be reduced.",
 "Removed relational calculus (slides, QB 58–63, PT1 Q6), proofs (Ch7; 'prove' dropped from CLO3/CLO5), NP-completeness (Ch7, Ch10, CQ7.3), ARIES (Ch10).",
 "Partly done",
 "Most of it is removed (PT1 Q6 is now division; QB 58–63 marked RETIRED; CLO3/CLO5 have no 'prove'; CQ7.3 rewritten). Left over: Chapter_2 s.25 still says 'Self-study: relational calculus (DSC online Ch. 27) with worksheet' and s.32 'Relational calculus expresses the same idea with ∀ (self-study)', while s.35 says calculus is not part of the course; Chapter_10 s.33 and s.43 list ARIES (§19.9, Mohan 1992) as optional reading; QB 374 option D 'NP-complete'; QB 260–261 are proof questions (Analyze); syllabus Description C12 still says 'prove that a decomposition is correct'; RA exercise sheet ex. 9 'Prove it or give a counterexample'; project milestone 1 asks for 'FD proofs'.",
 "Delete the calculus self-study line on Ch2 s.25 and s.32; drop the ARIES reading or say 'not assessed'; rewrite QB 374 (D) and decide on QB 260–261; change C12 to 'check that a decomposition is lossless'; reword the RA ex. 9 and the project 'FD proofs'."),
("M07","BM.09","2.2 (row 15)","Slides – citations",
 "Add the source on slides that use referenced tables, examples or algorithms.",
 "Source line (18 pt) on every slide based on the textbook and on every diagram.",
 "Partly done",
 "Diagrams all have a caption. About 86 of 265 content slides have no source line, mostly '(cont.)' slides and T-SQL slides: Ch1 10 (mostly course-admin slides, acceptable), Ch2 16 (e.g. RA operators s.19–26), Ch3 4, Ch4 6, Ch5 15, Ch6 6, Ch7 15 (BCNF, 3NF, Armstrong's axioms s.13–19), Ch8 6, Ch9 6 (join algorithms s.13–18), Ch10 2.",
 "Repeat the source line on every '(cont.)' slide; cite the T-SQL reference on Ch5 slides; add sources on the Ch2, Ch7, Ch9 slides listed in 'Slide checks'."),
("M08","BM.09","2.3 (row 16)","Labs – levels and solutions",
 "Split each lab into 3 levels (step-by-step / partial hints / advanced); provide exercise solutions.",
 "5 labs in 3 levels, Investigate ≥ 40%, time table and 10-point rubric; one solution file per lab; every new exercise sheet has solutions.",
 "Done",
 "Labs 1–5 each have Level 1 – guided, Level 2 – partial hints, Level 3 – Investigate, a time plan and a rubric; Level 3 is 40–50% of the marks. IDB201_Lab1–5_Solution.docx exist; all 7 exercise sheets have a _Solutions file.",
 "Lab 5 part 1 has no Level 2 task (Level 2 is only in part 2); acceptable, but mention it if asked."),
("M09","BM.09","2.4 (row 17)","Slides – objectives",
 "Add a 'Learning objectives' slide for each chapter/session.",
 "'Learning objectives' slide after the roadmap of each chapter; summary split into 'Summary' and 'Before the next session'.",
 "Done",
 "Every deck has a 'Learning objectives' slide (slide 3) with its CLOs, a 'Summary' and a 'Before the next session' slide.",
 "Objectives are per chapter, not per session; the requirements sheet asks for 'each chapter', so this meets it."),
("M10","BM.09","2.5 (row 18)","Alignment – session 18",
 "Session 18 content is in Chapter_5.pptx, but the Schedule says 'Slides: Chapter 4'.",
 "Moved to Chapter_4.pptx.",
 "Done",
 "Chapter_4.pptx has a 'Session 18' section (18 slides: §5.1, SQL injection, parameterized queries); Chapter_5 starts with session 19/20.",
 ""),
("M11","BM.09","2.5 (row 18)","Alignment – missing materials",
 "Add the materials named in the Schedule: set-up guide (s.3), RA exercise sheet + solutions (s.8), bag-semantics worksheet (s.12), FD exercises + solutions (s.38), review questions and self-study reading list (s.58–59), practice set + solutions (s.60), project topic list (s.7).",
 "All added (calculus worksheet dropped); project lists 10 domains and the research tracks as the topic list.",
 "Done",
 "Present in 5_exercises: Setup_Guide, Ch2_RA_Exercise_Sheet (+Solutions), Ch3_Bag_Semantics_Worksheet (+Solutions), Ch7_FD_Exercises (+Solutions), Ch8_Indexing_Exercises (+Solutions), Review_Questions (+Solutions, includes the self-study reading list), Final_Practice_Set (+Solutions). Project §3.3 says the research tracks are the topic list; §3.4 has 10 domains.",
 "The Schedule's 'Student's materials' column does not name the new files for s.12 (worksheet), s.38 (FD exercises), s.44 (indexing exercises) and s.58–59 (review questions); add them so the syllabus and the folder match."),
("M12","BM.09","2.5 / 4 (rows 18, 25)","givenDB scripts",
 "Lab 3 and Lab 5 data files are missing; check university_sqlserver.sql and note.txt for consistency.",
 "lab3_scale.sql and lab5_large.sql are in materials/labs/sql and listed in note.txt; script and note both say SQL Server 2022, database University.",
 "Not done",
 "The submitted folder 3_labs contains only lab5_solution.sql and note.txt. note.txt lists university_sqlserver.sql, lab3_scale.sql, lab5_large.sql and solutions/lab1–4_solution.sql, none of which are in the folder. (Older versions exist in the GitHub repo, materials/labs/sql, last changed 28 Oct; they may not match the revised labs.)",
 "Add the current university_sqlserver.sql, lab3_scale.sql, lab5_large.sql and lab1–4_solution.sql to 3_labs (a givenDB subfolder) before sending the package back."),
("M13","BM.09","2.6 (row 19)","Slides – examples",
 "Examples need visuals and must run on givenDB.",
 "Diagrams added; all slide SQL moved to givenDB data (Fall 2025 / Spring 2026) and run on SQL Server 2022.",
 "Done",
 "SQL examples on slides use the givenDB years 2025/2026 (Ch2, Ch3, Ch9); diagrams as in M02. The SQL was not re-run for this check, because the revised givenDB script is not in the folder (see M12).",
 "Re-run the slide SQL once the current givenDB script is added."),
("M14","BM.09","2.7 (row 20)","Slides – practice",
 "Each chapter should have a 'Practice exercises' slide plus SQL self-practice on givenDB.",
 "'Practice exercises' and 'answers' slides in all 10 chapters (3 exercises each); separate sheets for Ch2, Ch3, Ch7, Ch8.",
 "Done",
 "All 10 decks have 'Practice exercises' and 'Practice exercises: answers' slides.",
 ""),
("M15","BM.09","2.8 (row 21)","Project guidance",
 "Provide a sample project or guidance, a report template, contribution log and peer-evaluation form.",
 "Report template, sample project, forms (M2 checklist, contribution log, peer evaluation).",
 "Done",
 "4_project has Group_Project, Project_Report_Template, Project_Sample, Project_Forms (10-item M2 checklist, contribution log, peer-evaluation form).",
 ""),
("M16","BM.09","3 (row 24) / Req. 3.1","Duration – slides per session",
 "After the font change slides must be split; ensure ≥ 10 slides per session (requirements sheet); balance lab time.",
 "≈ 430 slides; lab time tables added; Lab 2 and Lab 4 Investigate reports due within 48 h.",
 "Not done",
 "433 slides in total, but 22 of the 40 lecture sessions have fewer than 10 slides (counted from the 'Session N' divider, divider included): s.5 (9), 10 (7), 15 (9), 16 (9), 17 (7), 20 (7), 21 (5), 23 (9), 27 (8), 29 (7), 32 (6), 33 (7), 34 (5), 35 (6), 36 (6), 41 (9), 43 (8), 45 (8), 46 (7), 50 (8), 51 (5), 53 (6). Sessions 8 and 38 (guided exercises) have no slide section. Lab time tables exist in all 5 labs.",
 "Either add content (examples, worked exercises, diagrams) to the short sessions, or ask the reviewer whether the rule counts merged '(cont.)' slides; fixing M05 by merging will lower the counts further, so plan both together."),
("M17","BM.09","4 (row 25)","Progress tests – format",
 "Do progress tests need written items, as in the Grading structure sheet?",
 "PT = 20 MCQ, computer-marked, no written part; Grading structure fixed.",
 "Done",
 "PT1 and PT2 have 20 MCQ each; Grading structure J3/J4 say '20 MCQ', I3/I4 'Multiple choices (marked by computer)'.",
 ""),
("M18","BM.09","4 (row 25)","Labs – solutions and database name",
 "Labs lack sample solutions; Lab 5 part 2 uses 'University' but the script creates 'UniversityDB'.",
 "Sample solutions for all 5 labs; Lab 5 uses University.",
 "Done",
 "Five _Solution.docx files; Lab 5 says 'on the database University'; no 'UniversityDB' in any file.",
 ""),
# ---------------- BM.10 syllabus ----------------
("S01","BM.10","Materials (row 10)","Syllabus – materials",
 "Main textbook should be recent (≤ 5 years, ≤ 500 pages); DMS 2003 is too old, keep it only as a reference; rows B9–B16 of Materials are unclear.",
 "DSC 7th ed. kept as main textbook (latest edition, only scheduled chapters used); DMS moved to reference; B9–B16 deleted.",
 "Done",
 "Materials sheet: DSC = textbook (2020, 7th, note explains scope); DMS = reference only; T-SQL reference online. Sheet now ends at row 4.",
 "DSC is still > 500 pages; the reply argues that only scheduled chapters are used. The reviewer may raise it again in round 2."),
("S02","BM.10","LO (row 11)","Syllabus – CLOs",
 "No CLO on attitude/ethics: add one or extend CLO8 with academic integrity, responsible use of generative AI and teamwork.",
 "CLO8 extended (integrity, AI disclosure, individual responsibility), mapped to PLO10, PLO11.",
 "Done",
 "CLO8 text includes citing sources, disclosing generative AI and responsibility for one's part; CLO–PLO table maps CLO8 to PLO5, PLO7, PLO10, PLO11. Project has contribution log and peer evaluation.",
 ""),
("S03","BM.10","LO (row 13)","Syllabus – CLO–PLO",
 "CLOs basically meet the PLOs; review and add mappings.",
 "CLO–PLO table reviewed.",
 "Done",
 "Mapping present for all 8 CLOs; CLO1 and CLO7 map only to PLO2.",
 "The reply only says 'reviewed'; consider stating what changed (CLO8 → PLO10/11; CLO5 → PLO8 removed earlier)."),
("S04","BM.10","Schedule (row 14)","Syllabus – order",
 "Teach E-R and normalization before SQL.",
 "Awaiting course owner: proposes keeping DSC order (SQL first gives tools for Labs 1–3).",
 "Pending decision",
 "Schedule unchanged: SQL Ch3–5 (s.9–25) before E-R Ch6 (s.27–30) and normalization Ch7 (s.32–38).",
 "Course owner to decide; if the order changes, slides, labs, PTs and QB chapter numbers all change."),
("S05","BM.10","Schedule (row 15)","Syllabus – workload",
 "Content load too large: reconsider DSC Ch. 14, 15, 18, 19.",
 "Awaiting course owner: keep core of Ch14–15 (in the course description), cut Ch18–19 and advanced sections.",
 "Pending decision",
 "Schedule still includes Ch18 (s.51 §18.1; s.53 §18.2, 18.4, 18.8; Lab 5 part 2) and Ch19 (s.55). The reply's proposal to cut Ch18–19 is not yet reflected in the syllabus, slides (Chapter_10), Lab 5 or QB.",
 "Course owner to decide; if Ch18–19 are cut, update Chapter_10, Lab 5 part 2, QB chapter 10 items and CQ10.x, and reuse the freed sessions (see S09)."),
("S06","BM.10","Schedule (row 17)","Syllabus – practice slots",
 "Re-allocate chapters; exercise/practice/review slots to be reviewed again.",
 "Materials added for s.8, 12, 38, 44, 58–60; re-allocation after S05.",
 "Pending decision",
 "Materials for the practice/review sessions exist (see M11); the allocation itself waits for S04/S05.",
 ""),
("S07","BM.10","Assessment (row 18)","Syllabus – PT scope",
 "Re-order chapters before judging PT1/PT2; tests and assessments should cover the theory of the chapters.",
 "PTs are 20 MCQ, not taken from the final bank; PT2 scope adjusted once the order is decided.",
 "Pending decision",
 "PT1 = Ch1–5 (session 26), PT2 = Ch6–7 (session 40); Ch8–10 are covered only by the project and the final exam.",
 "Decide together with S04/S05/S09."),
("S08","BM.10","Assessment (row 20)","Project – timing",
 "(1) Session 54 overload for concurrency teams; (2) final report before session 56; (3) 'clinic' domain duplicates Lab 4; (4) ungraded M2 needs a checklist.",
 "(1) experiments outside class; (2) report due 3 days before s.56; (3) clinic removed, 10 new domains; (4) 10-item checklist.",
 "Done",
 "Project brief: isolation-levels teams run experiments outside class after M2; 'Final report and scripts due three days before session 56'; 'the clinic of Lab 4 may not be used' + 10-domain list; Project_Forms has a 10-item M2 checklist. Grading structure L5 matches.",
 ""),
("S09","BM.10","Assessment (row 21)","Syllabus – PT spacing",
 "Space the progress tests further apart; PT2 only covers up to Chapter 7.",
 "Awaiting course owner: will space PT2 after the Ch18–19 decision.",
 "Pending decision",
 "PT1 s.26, PT2 s.40 (unchanged).",
 "Decide together with S05."),
("S10","BM.10","Others (row 22)","Syllabus – template typo",
 "'Leaning-Teaching Method' → 'Learning-Teaching Method'.",
 "Fixed.",
 "Done",
 "Syllabus B7 = 'Learning-Teaching Method'.",
 ""),
("S11","BM.10","Others (row 22)","Syllabus – fake links",
 "Schedule columns J/K contain fake drive.google.com links and the line 'Chỉ để Link nếu thật sự có Link.'",
 "Deleted.",
 "Done",
 "Columns J and K of the Schedule are empty; no 'drive.google' or 'Chỉ để Link' anywhere in the workbook.",
 ""),
("S12","BM.10","Others (row 22)","Syllabus – tool versions",
 "Use one SQL Server version (givenDB script says '2019+', note.txt '2022').",
 "SQL Server 2022 in Tools, givenDB and note.txt.",
 "Partly done",
 "Tools (C14) and note.txt say SQL Server 2022. The givenDB script itself is not in the folder, so its header could not be checked (the older repo copy says 2022).",
 "Include the current university_sqlserver.sql (see M12)."),
("S13","BM.10","Others (row 22)","Syllabus – 9 CQ answers",
 "Why '5 labs + 9 CQ answers'? Is 9 correct?",
 "One CQ answer per chapter; Chapter 5 has no CQ, so 9.",
 "Done",
 "Note C15 now says '(one CQ answer per chapter; Chapter 5 has no CQ)'; Grading structure K2/M2 explain it; CQ sheet has 27 questions over 9 chapters.",
 "In the CQ sheet the Chapter column reads 'Chapter 4,5,9', 'Chapter 8,14', 'Chapter 9,15', 'Chapter 10,19', which mixes course and DSC chapter numbers; consider 'Chapter 4 (DSC Ch. 4, 5, 9)'."),
("S14","BM.10","Others (row 22)","Syllabus – Python tools",
 "Python 3 with pyodbc/pandas, VS Code/PyCharm: relevant to this course?",
 "Removed from Tools.",
 "Done",
 "Tools lists SQL Server 2022, SSMS, draw.io, RelaX only; no Python anywhere in the syllabus.",
 ""),
("S15","BM.10","Description (row 8)","Syllabus – description",
 "Description consistent with the curriculum (reply: relational calculus removed from C12).",
 "C12 no longer mentions relational calculus.",
 "Partly done",
 "C12 has no relational calculus, but its 5th bullet still says 'and prove that a decomposition is correct', which conflicts with removing proofs (M06).",
 "Change to '… and check that a decomposition is lossless and dependency-preserving'."),
# ---------------- BM.12 question bank ----------------
("Q01","BM.12","I.1 (row 7)","QB – keys and LO",
 "No wrong key found; Chapter ↔ CLO consistent.",
 "Keys kept; keys of edited and 70 new items checked.",
 "Done",
 "470 items parsed, each with 4 options and one key; chapter–CLO pattern unchanged.",
 "Keys of the edited items were not re-solved one by one in this check."),
("Q02","BM.12","I.2 (row 8)","QB – template",
 "Follow the 'Question Bank_Template_MC_MOOC' format (QN=, a–f, ANSWER, MARK, UNIT, LO, MIX CHOICES).",
 "IDB201_QB_MC_MOOC.docx exported; retired items not exported.",
 "Done",
 "MOOC file has 464 QN tables with a–f, ANSWER, MARK 0.2, UNIT, LO, MIX CHOICES; every key matches the main bank; the 6 retired items (58–63) are not exported.",
 ""),
("Q03","BM.12","I.3 (row 9)","QB – Bloom levels",
 "Report of level mix (R 24%, U 34%, Ap 21%, An 21%).",
 "After additions: 464 in use – R 93 (20%), U 135 (29%), Ap 86 (19%), An 150 (32%).",
 "Done",
 "Recounted: 464 in use; Remember 93, Understand 135, Apply 86, Analyze 150 – same as the reply.",
 ""),
("Q04","BM.12","I.4 (row 10)","QB – enough Analyze items",
 "With ≥ 15 Analyze items per form, 83 Analyze items give only 5–6 forms (Ch1 3, Ch6 4, Ch9 5 Analyze).",
 "70 items added (QB 401–470); 150 Analyze items, enough for ≥ 10 forms.",
 "Done",
 "Analyze items per chapter now: Ch1 9, Ch2 14, Ch3 20, Ch4 16, Ch5 15, Ch6 13, Ch7 23, Ch8 13, Ch9 12, Ch10 15 (total 150).",
 "150 = exactly 10 forms × 15 without reuse; with the 70% change rule this holds for about 10 exam forms before reuse."),
("Q05","BM.12","I.5 (row 11)","QB – length cue",
 "269/400 keys are the longest option; students guess from length.",
 "≈ 230 items rewritten; key is the longest in 141/464 (≈ 30%); only 5 items with clearly longer key; key positions 117/119/117/117.",
 "Done",
 "Recounted by characters: the key is the unique longest option in 155/464 (33%) – a little higher than the 141 in the reply, but near chance (25%). For the 154 items the reviewer flagged, no key is now more than 20% longer than the longest distractor. Only 3 items have a key ≥ 1.5× longer (QB 39, 365, 370: short numeric or term options). Key positions in use: A 116, B 117, C 115, D 116.",
 "Correct the figure in the reply (155, not 141) or say how it was counted."),
("Q06","BM.12","I.6 (row 12)","QB – overlap with PTs",
 "QB 31, 99, 251, 253, 267 look similar to PT1/PT2 items.",
 "QB 31, 99, 128, 251, 253, 267 replaced; PTs use no bank items.",
 "Partly done",
 "The listed items were replaced. Some bank items still use the same template as a PT item with different data: PT2 Q14 ↔ QB 267 (is this decomposition lossless / dependency-preserving?), PT2 Q9 ↔ QB 444 (how many candidate keys?), PT1 Q3 ↔ QB 32 (how many superkeys?). Since PTs are returned to students, these are 'same form' pairs.",
 "Change the question form of QB 267 (e.g. ask for the missing FD or the 3NF result), or accept and note that only the data are shared."),
("Q07","BM.12","I.7 (row 13)","QB – shared-data groups",
 "7 groups share one table/schema (G1–G7); at most one item per group per form; 127/128 should not share the same stem.",
 "Group code on each item; composition rule added; 128 rewritten.",
 "Done",
 "Group tags exactly as the reviewer listed: G1 85, 88, 89; G2 92, 93, 96; G3 125–129; G4 250–253; G5 254–256; G6 341, 342, 343, 347; G7 398, 399. Rule 'take at most one question from each shared-data group' is in the composition instructions; QB 128 has a new stem.",
 ""),
("Q08","BM.12","I.8 (row 14)","QB – time per form",
 "50 items in 60 min but ≥ 15 Analyze items need 2–4 min each; note the level of each item on the form.",
 "Composition rule 10 R + 13 U + 12 Ap + 15 An ≈ 60 min; order from easy to hard; level shown in the bank.",
 "Done",
 "Instructions give per-level time guidance, ordering from Remember to Analyze, and showing the level on the lecturer's copy.",
 ""),
("Q09","BM.12","II (per item)","QB – item comments",
 "193 item-level comments: 154 'key longer than distractors', 22 '(CQx.y) label', 24 shared-data group, 5 PT overlap, plus QB 22, 55, 117, 380.",
 "Each item answered in column D.",
 "Done",
 "Every item comment checked automatically – see sheet 'QB item checks' (all 193 rows Done).",
 ""),
("Q10","BM.12","(cross-check with M06)","QB – leftover advanced items",
 "(Not raised by the QB reviewer; follows from the content-level decision in BM.09 2.1.)",
 "NP-completeness and proofs removed from the course.",
 "Partly done",
 "QB 374 still has 'Testing view serializability is NP-complete' as its key; QB 260 ('which sequence of axioms proves the union rule') and 261 ('to prove augmentation sound…') are proof items at Analyze level.",
 "Rewrite QB 374 without NP-completeness; retire or rewrite QB 260–261 as derivation items."),
]

wb = Workbook()

# ---------- Summary ----------
ws = wb.active; ws.title = "Summary"
ws["A1"] = "IDB201 – Council review of 18 Nov 2026 (round 1): verification of the revision"
ws["A1"].font = Font(name=F, bold=True, size=14, color="1F3864")
ws["A2"] = ("Each request from the three review forms (BM.09 learning materials, BM.10 syllabus, BM.12 question bank) "
            "was checked against the folder IDB201_ket-qua-sua_lan1_1 (pushed 24 Nov 2026). "
            "Status is what the files show, not what the reply in column D of the form says.")
ws["A2"].alignment = Alignment(wrap_text=True, vertical="top"); ws.merge_cells("A2:F2"); ws.row_dimensions[2].height = 45
ws["A2"].font = Font(name=F, size=10)
hdr = ["Form", "Requests"] + STATUSES
for j, h in enumerate(hdr, 1):
    c = ws.cell(4, j, h); c.font = Font(name=F, bold=True, color="FFFFFF"); c.fill = HDR; c.alignment = Alignment(horizontal="center", wrap_text=True); c.border = BOX
forms = [("BM.09", "BM.09 – learning materials"), ("BM.10", "BM.10 – syllabus"), ("BM.12", "BM.12 – question bank")]
n = len(R) + 1
for i, (code, label) in enumerate(forms, 5):
    ws.cell(i, 1, label)
    ws.cell(i, 2, f'=COUNTIF(Requests!$B$2:$B${n},"{code}")')
    for j, st in enumerate(STATUSES, 3):
        ws.cell(i, j, f'=COUNTIFS(Requests!$B$2:$B${n},"{code}",Requests!$G$2:$G${n},"{st}")')
ws.cell(8, 1, "Total").font = Font(name=F, bold=True)
for j in range(2, 7):
    col = get_column_letter(j)
    ws.cell(8, j, f"=SUM({col}5:{col}7)").font = Font(name=F, bold=True)
for r in range(5, 9):
    for j in range(1, 7):
        c = ws.cell(r, j); c.border = BOX
        if c.font.bold is not True: c.font = Font(name=F)
        if j > 1: c.alignment = Alignment(horizontal="center")
for j, st in enumerate(STATUSES, 3):
    ws.cell(4, j).fill = PatternFill("solid", fgColor=FILLS[st]); ws.cell(4, j).font = Font(name=F, bold=True, color="000000")

ws["A10"] = "Main points to fix before round 2"; ws["A10"].font = Font(name=F, bold=True, size=12, color="1F3864")
key = [
 "M12 – the submitted folder lacks the givenDB scripts (university_sqlserver.sql, lab3_scale.sql, lab5_large.sql) and the Lab 1–4 solution SQL that note.txt lists; the reviewer asked for exactly these.",
 "M16 – 22 of 40 lecture sessions have fewer than 10 slides, against the '≥ 10 slides per session' requirement.",
 "M05 – automatic splitting left 63 near-empty '(cont.)' slides, so the 'empty bottom half' comment can come back.",
 "M06 / S15 / Q10 – leftovers of removed topics: relational calculus self-study on Ch2 s.25 and s.32, ARIES reading in Ch10, NP-completeness in QB 374, proof items QB 260–261, 'prove' in syllabus C12, 'FD proofs' in the project.",
 "M04 / M07 – diagram labels at 15–16 pt (< 18 pt); about 86 content slides without a source line.",
 "S04, S05, S06, S07, S09 – waiting for the course owner's decision (order of E-R/normalization vs SQL; cutting Ch18–19; PT spacing). The reply proposes cutting Ch18–19, but the materials still include them.",
]
for i, t in enumerate(key, 11):
    c = ws.cell(i, 1, "• " + t); c.font = Font(name=F, size=10); c.alignment = Alignment(wrap_text=True, vertical="top")
    ws.merge_cells(start_row=i, start_column=1, end_row=i, end_column=6); ws.row_dimensions[i].height = 42
r0 = 11 + len(key) + 1
ws.cell(r0, 1, "Status key").font = Font(name=F, bold=True)
desc = {"Done": "the files show the requested change",
        "Partly done": "changed, but something the reviewer asked for, or the reply claims, is still missing",
        "Not done": "the files do not show the change",
        "Pending decision": "the reply defers it to the course owner"}
for i, st in enumerate(STATUSES, r0 + 1):
    c = ws.cell(i, 1, st); c.fill = PatternFill("solid", fgColor=FILLS[st]); c.font = Font(name=F); c.border = BOX
    ws.cell(i, 2, desc[st]).font = Font(name=F, size=10)
ws.column_dimensions["A"].width = 30
for col in "BCDEF": ws.column_dimensions[col].width = 16
ws.freeze_panes = "A5"

# ---------- Requests ----------
wr = wb.create_sheet("Requests")
H = ["ID", "Form", "Form item (row)", "Area", "Council request", "Designer's reply (column D, summarized)", "Verified status", "Evidence found in the folder", "Remaining action"]
W = [6, 8, 14, 18, 48, 40, 14, 70, 48]
for j, (h, w) in enumerate(zip(H, W), 1):
    c = wr.cell(1, j, h); c.font = Font(name=F, bold=True, color="FFFFFF"); c.fill = HDR
    c.alignment = Alignment(wrap_text=True, vertical="center"); c.border = BOX
    wr.column_dimensions[get_column_letter(j)].width = w
for i, row in enumerate(R, 2):
    for j, v in enumerate(row, 1):
        c = wr.cell(i, j, v); c.font = Font(name=F, size=10, bold=(j == 7))
        c.alignment = Alignment(wrap_text=True, vertical="top"); c.border = BOX
    longest = max(len(row[4]) / 48, len(row[7]) / 70, len(row[8]) / 48, len(row[5]) / 40)
    wr.row_dimensions[i].height = max(30, min(409, 13.5 * (int(longest) + 2)))
last = len(R) + 1
for st in STATUSES:
    wr.conditional_formatting.add(f"G2:G{last}", FormulaRule(formula=[f'$G2="{st}"'], fill=PatternFill("solid", fgColor=FILLS[st])))
dv = DataValidation(type="list", formula1='"' + ",".join(STATUSES) + '"', allow_blank=False)
wr.add_data_validation(dv); dv.add(f"G2:G{last}")
wr.freeze_panes = "E2"; wr.auto_filter.ref = f"A1:I{last}"

# ---------- Slide checks ----------
S = json.load(open("slide_checks.json"))
wsl = wb.create_sheet("Slide checks")
H2 = ["Deck", "Slides", "Fonts used", "Text runs < 18 pt", "Diagram slides", "Near-empty '(cont.)' slides", "Content slides without a source line", "Sessions with < 10 slides (count)"]
W2 = [16, 8, 20, 12, 18, 30, 60, 34]
for j, (h, w) in enumerate(zip(H2, W2), 1):
    c = wsl.cell(1, j, h); c.font = Font(name=F, bold=True, color="FFFFFF"); c.fill = HDR; c.alignment = Alignment(wrap_text=True); c.border = BOX
    wsl.column_dimensions[get_column_letter(j)].width = w
for i, d in enumerate(S, 2):
    vals = [d["deck"], d["slides"], d["fonts"], d["small"], d["diag"], d["cont"], d["nosrc"], d["short"]]
    for j, v in enumerate(vals, 1):
        c = wsl.cell(i, j, v); c.font = Font(name=F, size=10); c.alignment = Alignment(wrap_text=True, vertical="top"); c.border = BOX
    wsl.row_dimensions[i].height = 75
t = len(S) + 2
wsl.cell(t, 1, "Total").font = Font(name=F, bold=True)
wsl.cell(t, 2, f"=SUM(B2:B{t-1})").font = Font(name=F, bold=True)
wsl.cell(t, 4, f"=SUM(D2:D{t-1})").font = Font(name=F, bold=True)
wsl.cell(t + 2, 1, "How counted: slides per session run from a 'Session N' divider to the next one (divider included; the last session of a deck also holds the practice and summary slides). "
         "'Near-empty' = a '(cont.)' slide with under 160 characters of body text and no table. A source line = text with DSC, 'Source', the T-SQL reference or 'written for IDB201'.").font = Font(name=F, size=9, italic=True)
wsl.freeze_panes = "B2"

# ---------- QB item checks ----------
Q = json.load(open("qb_rows.json"))
wq = wb.create_sheet("QB item checks")
H3 = ["QB", "Reviewer's comment (BM.12 part II)", "Check made on the revised bank", "Status"]
W3 = [7, 60, 75, 12]
for j, (h, w) in enumerate(zip(H3, W3), 1):
    c = wq.cell(1, j, h); c.font = Font(name=F, bold=True, color="FFFFFF"); c.fill = HDR; c.border = BOX
    wq.column_dimensions[get_column_letter(j)].width = w
for i, (nq, iss, act, chk, st) in enumerate(sorted(Q, key=lambda x: x[0]), 2):
    for j, v in enumerate([nq, iss or act, chk, st], 1):
        c = wq.cell(i, j, v); c.font = Font(name=F, size=10); c.alignment = Alignment(wrap_text=True, vertical="top"); c.border = BOX
lq = len(Q) + 1
for st in STATUSES:
    wq.conditional_formatting.add(f"D2:D{lq}", FormulaRule(formula=[f'$D2="{st}"'], fill=PatternFill("solid", fgColor=FILLS[st])))
wq.freeze_panes = "A2"; wq.auto_filter.ref = f"A1:D{lq}"

wb.save("IDB201_Council_Review1_Verification.xlsx")
print("rows", len(R))

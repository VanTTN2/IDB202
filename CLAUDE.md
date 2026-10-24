# CLAUDE.md – IDB201 course development project

Read this file and `docs/project-context.md` before doing any work in this repository.
`docs/project-context.md` is the full record of phase 1 (decisions, sources, history, open items).

## Who and what

- The course owner (the user) is a lecturer at FPT University building the course **IDB201 – Introduction to Databases**.
- The program is the Bachelor of Computer Science, AI and Data Science specialization (BCS_AD), cohort K22A. The course runs in Year 1, Semester 1 (S1), has 3 credits, and has no prerequisite.
- The learners are **talented-student (honors) classes**, so the course is **academic and research-oriented rather than applied**. This was a requirement from the program leadership.
- The GitHub repository is named `VanTTN2/IDB202`, but the **course code is IDB201**, as confirmed by the user. Never use IDB202 as the course code.

## Working rules (from the user)

- **Talk to the user in Vietnamese.** Write **all project content in English**: syllabus, notes, lectures, labs, code comments.
- **Work in phases, and do not get ahead of approval.** Phase 1 is the syllabus. Detailed lecture content and labs are built **only after the council approves the syllabus**. Do not write chapter content or labs unless the user asks for it.
- The syllabus is a **draft for the council review**. The decision number and approval date stay blank on purpose, and the user does not need reminders about them.
- The official textbooks, both required by the user, are:
  - [DSC] Silberschatz, Korth & Sudarshan, *Database System Concepts*, 7th ed., 2020;
  - [DMS] Ramakrishnan & Gehrke, *Database Management Systems*, 3rd ed., 2003.
- Syllabus deliverables must follow the university template `syllabus/template/Syllabus_Temp.xlsx`.
- **Textbook PDFs:** the user owns copies of the textbooks and allows Claude to **read** them when writing course materials. The user uploads them to the session when needed; they are not stored on GitHub. If you place one in `docs/sources/textbooks/`, that folder is git-ignored. **Never commit a textbook PDF** or large verbatim extracts. Paraphrase, and cite by chapter, section and page. Status: DSC (7th ed.) is kept on the user's PC and will be uploaded when content work starts; the user will send DMS (3rd ed.) later.
- The user reviews documents in Word or Excel. Send deliverables as files, and push every change to the branch.

## Current phase

**Phase 2 (materials) started on 2026-10-24** at the user's request: slides, labs, group project, progress tests, final-exam bank and a consistency review are in `materials/` (see `docs/project-context.md` §0b). Phase 1 (syllabus) is complete; the user's uploaded workbook is the authoritative syllabus. Open decisions are listed in §8 of `materials/review/out/IDB201_Consistency_Review.docx`.

## Key files

| File | Purpose |
|---|---|
| `syllabus/build_syllabus_xlsx.py` | Generator for the syllabus. **Out of date since 2026-10-19:** the xlsx was edited directly for the council feedback (see `docs/project-context.md` §0a). Sync it with the xlsx before running it |
| `syllabus/IDB201_Syllabus.xlsx` | Generated syllabus workbook in the university template (6 sheets) |
| `syllabus/syllabus.md` | Generated Markdown view of the same syllabus |
| `docs/build_brief.js` | Source of the council brief (docx-js) |
| `docs/IDB201_Academic_Emphasis_Brief.docx` | Generated brief for the syllabus review council |
| `docs/course-introduction.md` | Short course objectives (latest wording, highlighting formal foundations, algorithms, complexity, correctness, system internals); used as the syllabus Description (C12) |
| `docs/course-design-notes.md` | CS-core vs. other majors; research orientation; seminal readings |
| `docs/project-context.md` | Full phase-1 record: decisions, sources, history, next steps |
| `docs/sources/` | Source files from the user: curriculum (Phuluc_2_BCS_AD_Final.xlsx), 13 PLOs (BCS_AD_13_PLO.xlsx) |
| `materials/` | **Phase-2 materials** and their builders: slides, labs (with SQL Server scripts), project brief, progress tests, final-exam bank, consistency review |
| `lectures/`, `labs/` | Old drafts from before the pause; superseded by `materials/`, not used |

## Regenerating

```bash
pip install openpyxl && python syllabus/build_syllabus_xlsx.py
npm install docx && node docs/build_brief.js docs/IDB201_Academic_Emphasis_Brief.docx
```

If you change CLOs, the schedule or the weights, update **both** `syllabus/build_syllabus_xlsx.py` and `docs/build_brief.js` so that they stay consistent. The CLO–assessment matrix and the CLO–PLO tables in the brief are written by hand.

## Testing the drafts (phase 2)

- SQL scripts target SQL Server 2022. In a cloud session: start `dockerd`, run `mcr.microsoft.com/mssql/server:2022-latest`, and use `/opt/mssql-tools18/bin/sqlcmd` inside the container.
- Python reference solutions: `cd labs/python && PYTHONPATH=../solutions/python python -m pytest tests`.

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
- The user reviews documents in Word or Excel. Send deliverables as files, and push every change to the branch.

## Current phase

**Phase 1 (syllabus) is complete and awaiting council review.** The next step is to apply the council's feedback, then start phase 2 (content development). See `docs/project-context.md` §6.

## Key files

| File | Purpose |
|---|---|
| `syllabus/build_syllabus_xlsx.py` | **Single source of truth for the syllabus.** Edit the data here, then run it to regenerate both the xlsx and the md |
| `syllabus/IDB201_Syllabus.xlsx` | Generated syllabus workbook in the university template (6 sheets) |
| `syllabus/syllabus.md` | Generated Markdown view of the same syllabus |
| `docs/build_brief.js` | Source of the council brief (docx-js) |
| `docs/IDB201_Academic_Emphasis_Brief.docx` | Generated brief for the syllabus review council |
| `docs/course-design-notes.md` | CS-core vs. other majors; research orientation; seminal readings |
| `docs/project-context.md` | Full phase-1 record: decisions, sources, history, next steps |
| `docs/sources/` | Source files from the user: curriculum (Phuluc_2_BCS_AD_Final.xlsx), 13 PLOs (BCS_AD_13_PLO.xlsx) |
| `lectures/`, `labs/` | **Early drafts, on hold.** Written before the user paused content work. Revise them to the approved syllabus in phase 2; do not treat them as final |

## Regenerating

```bash
pip install openpyxl && python syllabus/build_syllabus_xlsx.py
npm install docx && node docs/build_brief.js docs/IDB201_Academic_Emphasis_Brief.docx
```

If you change CLOs, the schedule or the weights, update **both** `syllabus/build_syllabus_xlsx.py` and `docs/build_brief.js` so that they stay consistent. The CLO–assessment matrix and the CLO–PLO tables in the brief are written by hand.

## Testing the drafts (phase 2)

- SQL scripts target SQL Server 2022. In a cloud session: start `dockerd`, run `mcr.microsoft.com/mssql/server:2022-latest`, and use `/opt/mssql-tools18/bin/sqlcmd` inside the container.
- Python reference solutions: `cd labs/python && PYTHONPATH=../solutions/python python -m pytest tests`.

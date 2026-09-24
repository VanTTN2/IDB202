# IDB201 – Introduction to Databases

Course materials for **IDB201 – Introduction to Databases**, taught to talented-student (honors) classes of the Bachelor of Computer Science, AI and Data Science specialization (BCS_AD, K22A), in Year 1, Semester 1. The course is academic and research-oriented. All content is in English.

> **Continuing this project?** Read [`CLAUDE.md`](CLAUDE.md) and [`docs/project-context.md`](docs/project-context.md) first.

## Status

| Deliverable | Status |
|---|---|
| Syllabus (university template) – [`syllabus/IDB201_Syllabus.xlsx`](syllabus/IDB201_Syllabus.xlsx), with a Markdown view in [`syllabus/syllabus.md`](syllabus/syllabus.md) | **Proposal, awaiting council review** |
| Academic emphasis brief for the review council – [`docs/IDB201_Academic_Emphasis_Brief.docx`](docs/IDB201_Academic_Emphasis_Brief.docx) | Ready |
| Course design notes – [`docs/course-design-notes.md`](docs/course-design-notes.md) | Ready |
| Lecture notes, labs, solutions, sample database (`lectures/`, `labs/`) | **Early draft, on hold** until the syllabus is approved; they will then be revised to match the approved syllabus |

## Repository structure

| Folder | Contents |
|---|---|
| [`syllabus/`](syllabus/) | The syllabus workbook, its generator script, and the official template |
| [`docs/`](docs/) | Design notes, the council brief (with its generator script), and the project context record |
| [`docs/sources/`](docs/sources/) | Source files from the course owner: curriculum and PLOs |
| [`lectures/`](lectures/) | Draft lecture notes (Chapters 1–10, Appendix A) |
| [`labs/`](labs/) | Draft labs, the `UniversityDB` sample database, Python starter tests, and solutions |

## Regenerating the documents

```bash
pip install openpyxl
python syllabus/build_syllabus_xlsx.py      # -> syllabus/IDB201_Syllabus.xlsx and syllabus/syllabus.md

npm install docx
node docs/build_brief.js docs/IDB201_Academic_Emphasis_Brief.docx
```

To change the syllabus, edit the data at the top of `syllabus/build_syllabus_xlsx.py` (general information, materials, CLOs, the 60-session schedule, constructivist questions, grading) and run it again. The template in `syllabus/template/` is never modified.

## Technical environment (for the draft labs)

- Microsoft SQL Server 2019 or later, with SSMS or Azure Data Studio
- Python 3 with `pyodbc`, `pandas`, `pytest`
- The sample database script [`labs/database/university.sql`](labs/database/university.sql) creates `UniversityDB`; it has been tested on SQL Server 2022.

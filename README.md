# IDB202 – Introduction to Databases

Course materials for **IDB202 – Introduction to Databases**, written in English and authored in Markdown.

## Repository structure

| Folder | Contents |
|---|---|
| [`syllabus/`](syllabus/) | Course syllabus: learning outcomes, assessment, and the 10-week schedule |
| [`lectures/`](lectures/) | Lecture notes, one file per chapter (10 chapters) |
| [`slides/`](slides/) | Slide decks, one per chapter, in [Marp](https://marp.app/) Markdown |
| [`labs/`](labs/) | Hands-on lab exercises, the sample database script, and solutions |
| [`question-bank/`](question-bank/) | Multiple-choice and written questions with answer keys |

## Chapters

| # | Chapter | Lecture | Slides | Lab |
|---|---|---|---|---|
| 1 | Introduction to Database Systems | [notes](lectures/ch01-introduction.md) | [slides](slides/ch01-introduction.md) | [Lab 1](labs/lab01-setup.md) |
| 2 | The Entity–Relationship Model | [notes](lectures/ch02-er-model.md) | [slides](slides/ch02-er-model.md) | [Lab 2](labs/lab02-er-design.md) |
| 3 | The Relational Model and ER-to-Relational Mapping | [notes](lectures/ch03-relational-model.md) | [slides](slides/ch03-relational-model.md) | [Lab 2](labs/lab02-er-design.md) |
| 4 | Relational Algebra | [notes](lectures/ch04-relational-algebra.md) | [slides](slides/ch04-relational-algebra.md) | [Lab 3](labs/lab03-relational-algebra.md) |
| 5 | SQL: Data Definition and Constraints | [notes](lectures/ch05-sql-ddl.md) | [slides](slides/ch05-sql-ddl.md) | [Lab 4](labs/lab04-ddl.md) |
| 6 | SQL: Queries | [notes](lectures/ch06-sql-queries.md) | [slides](slides/ch06-sql-queries.md) | [Lab 5](labs/lab05-queries.md) |
| 7 | SQL: Data Modification, Views, and Indexes | [notes](lectures/ch07-sql-dml-views-indexes.md) | [slides](slides/ch07-sql-dml-views-indexes.md) | [Lab 6](labs/lab06-dml-views.md) |
| 8 | Functional Dependencies and Normalization | [notes](lectures/ch08-normalization.md) | [slides](slides/ch08-normalization.md) | [Lab 7](labs/lab07-normalization.md) |
| 9 | Stored Procedures, Functions, and Triggers | [notes](lectures/ch09-procedures-triggers.md) | [slides](slides/ch09-procedures-triggers.md) | [Lab 8](labs/lab08-programmability.md) |
| 10 | Transactions and Concurrency Control | [notes](lectures/ch10-transactions.md) | [slides](slides/ch10-transactions.md) | [Lab 8](labs/lab08-programmability.md) |

## Technical environment

- **DBMS:** Microsoft SQL Server 2019 or later (Developer or Express edition)
- **Client:** SQL Server Management Studio (SSMS) or Azure Data Studio
- **Sample database:** [`labs/database/university.sql`](labs/database/university.sql) creates `UniversityDB` and loads its data. The lectures, labs, and question bank all use it.

## Rendering the slides

The slide decks use Marp Markdown. To export them:

```bash
npx @marp-team/marp-cli slides/ch01-introduction.md --pdf
# or export every deck to HTML
npx @marp-team/marp-cli slides/ --html
```

The **Marp for VS Code** extension can also preview the decks.

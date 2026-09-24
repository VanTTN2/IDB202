# IDB202 – Introduction to Databases: Course Syllabus

## 1. General information

| Item | Details |
|---|---|
| Course code | IDB202 |
| Course title | Introduction to Databases |
| Credits | 3 (30 contact hours of theory, 30 hours of lab) |
| Duration | 10 weeks, 2 sessions per week (one theory session and one lab session, 3 hours each) |
| Target learners | First-year Computer Science students, semester 1 |
| Prerequisites | None. Basic set and logic notation is reviewed where it is needed |
| Language of instruction | English |
| DBMS | Microsoft SQL Server (T-SQL) |

## 2. Course description

This course introduces the fundamental concepts of database systems. Students learn to model data with the Entity–Relationship (ER) model and to convert that model into a relational schema. They express queries in relational algebra and in SQL, and they improve schema quality through functional dependencies and normalization. The course also covers server-side programmability (stored procedures, functions, and triggers) and the basics of transactions and concurrency control. Throughout the course, students design, build, and query a working relational database.

## 3. Course learning outcomes (CLOs)

When they finish the course, students will be able to:

| CLO | Description | Bloom level |
|---|---|---|
| CLO1 | Explain the main concepts of database systems: data models, schemas, DBMS architecture, and data independence. | Understand |
| CLO2 | Design an Entity–Relationship model from a set of business requirements. | Create |
| CLO3 | Convert an ER model into a relational schema that has correct keys and integrity constraints. | Apply |
| CLO4 | Write queries in relational algebra. | Apply |
| CLO5 | Use SQL to create, modify, and query a database, including joins, aggregation, subqueries, and views. | Apply |
| CLO6 | Analyze functional dependencies and normalize relations to 3NF or BCNF. | Analyze |
| CLO7 | Write stored procedures, user-defined functions, and triggers that enforce business rules. | Apply |
| CLO8 | Explain the ACID properties, concurrency anomalies, and isolation levels, and use transactions correctly. | Understand |

## 4. Learning materials

**Textbooks**

- **[DSC]** Silberschatz, A., Korth, H. F., and Sudarshan, S. *Database System Concepts*, 7th ed. McGraw-Hill Education, 2020. ISBN 978-0-07-802215-9.
- **[DMS]** Ramakrishnan, R. and Gehrke, J. *Database Management Systems*, 3rd ed. McGraw-Hill, 2003. ISBN 978-0-07-246563-1.

**Online reference**

- Microsoft. *Transact-SQL reference*. https://learn.microsoft.com/sql/t-sql/

**Chapter-to-textbook reading map**

| Course chapter | DSC (7th ed.) | DMS (3rd ed.) |
|---|---|---|
| 1. Introduction to database systems | Ch. 1 | Ch. 1 |
| 2. The Entity–Relationship model | Ch. 6 (6.1–6.8) | Ch. 2 |
| 3. The relational model and ER-to-relational mapping | Ch. 2 (2.1–2.4), Ch. 6 (6.7) | Ch. 3 |
| 4. Relational algebra | Ch. 2 (2.5–2.6) | Ch. 4 (4.1–4.2) |
| 5. SQL: data definition and constraints | Ch. 3 (3.1–3.2), Ch. 4 (4.4–4.5) | Ch. 3 (3.2–3.3), Ch. 5 (5.7) |
| 6. SQL: queries | Ch. 3 (3.3–3.8), Ch. 4 (4.1) | Ch. 5 (5.1–5.6) |
| 7. SQL: data modification, views, and indexes | Ch. 3 (3.9), Ch. 4 (4.2), Ch. 14 (14.1–14.2, 14.9) | Ch. 3 (3.6), Ch. 8 |
| 8. Functional dependencies and normalization | Ch. 7 | Ch. 19 |
| 9. Stored procedures, functions, and triggers | Ch. 5 (5.2–5.3) | Ch. 5 (5.8–5.9), Ch. 6 (6.5) |
| 10. Transactions and concurrency control | Ch. 17, Ch. 18 (18.1–18.2) | Ch. 16, Ch. 17 |

**Course repository:** lecture notes, slides, labs, and the question bank in this repository.

## 5. Assessment

| Component | Weight | CLOs assessed | Description |
|---|---|---|---|
| Lab assignments (8 labs) | 20% | CLO2–CLO7 | Submitted at the end of each lab session |
| Progress test 1 (week 4) | 10% | CLO1–CLO4 | 30 multiple-choice questions and one ER design task |
| Progress test 2 (week 8) | 10% | CLO5, CLO6 | Practical SQL test on the computer |
| Group project | 20% | CLO2, CLO3, CLO5–CLO7 | Design and implement a database for a real-world scenario (3–4 students per group) |
| Practical exam | 15% | CLO5, CLO7 | 90 minutes, SQL on the computer |
| Final exam | 25% | CLO1–CLO8 | 60 minutes, 50 multiple-choice questions |

**Passing requirements:** every assessment component must have a score above 0, the final exam score must be at least 4/10, and the overall score must be at least 5/10.

## 6. Group project

Each group chooses a domain, such as a library, a clinic, an online store, or a hotel. The group submits the following deliverables:

1. A requirements statement (1–2 pages).
2. An ER diagram with the assumptions stated.
3. A relational schema normalized to at least 3NF, with a justification.
4. A T-SQL script that creates the tables, all constraints, and sample data (at least 10 rows per main table).
5. Ten meaningful queries, two views, two stored procedures, one function, and one trigger.
6. A 10-minute presentation and a demo in week 10.

## 7. Schedule

| Week | Session | Topic | Materials | Lab |
|---|---|---|---|---|
| 1 | 1 | Course overview; introduction to database systems | Ch. 1 | Lab 1: Install SQL Server and load `UniversityDB` |
| 2 | 2 | The Entity–Relationship model | Ch. 2 | Lab 2 (part A): ER design |
| 3 | 3 | The relational model and ER-to-relational mapping | Ch. 3 | Lab 2 (part B): mapping |
| 4 | 4 | Relational algebra; **progress test 1** | Ch. 4 | Lab 3: Relational algebra |
| 5 | 5 | SQL DDL and integrity constraints | Ch. 5 | Lab 4: DDL |
| 6 | 6 | SQL queries I: SELECT, joins, sorting | Ch. 6 | Lab 5 (part A) |
| 7 | 7 | SQL queries II: aggregation, subqueries, set operations | Ch. 6 | Lab 5 (part B) |
| 8 | 8 | Data modification, views, indexes; **progress test 2** | Ch. 7 | Lab 6: DML and views |
| 9 | 9 | Functional dependencies and normalization | Ch. 8 | Lab 7: Normalization |
| 10 | 10 | Stored procedures, functions, and triggers; transactions; project presentations | Ch. 9, Ch. 10 | Lab 8: Programmability and transactions |

## 8. Course policies

- **Attendance:** students must attend at least 80% of sessions to be eligible for the final exam.
- **Academic integrity:** lab work and project work must be your own or your group's own. Copying, or submitting AI-generated work without disclosing it, is handled under the university's academic integrity policy.
- **Late submissions:** the score is reduced by 20% for each day late, and work is not accepted more than 3 days after the deadline.

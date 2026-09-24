# Lab 2 – ER Design and Mapping to Relations

**Chapters:** 2, 3 · **Duration:** 2 sessions × 3 hours · **CLOs:** CLO2, CLO3

## Objectives

- Build an ER model from requirements written in plain English.
- Map the ER model to a relational schema with the 7-step algorithm.

**Tools:** draw.io (https://app.diagrams.net), Lucidchart, or pen and paper. Either Chen notation or crow's-foot notation is acceptable, but use one consistently.

---

## Part A – ER design (session 1)

### Exercise 1: Online bookstore

> The bookstore sells **books**. Each book has an ISBN, a title, a year, a price, and one or more **authors**. An author has an ID, a name, and a country. Each book is published by one **publisher**, which has an ID, a name, and an address. **Customers** have an ID, a name, an email, and one or more phone numbers. A customer places **orders**. Each order has an order number, a date, and a shipping address, and contains one or more books, each with a quantity. A customer may write a **review** of a book: a rating from 1 to 5 and a comment. A customer can review each book at most once.

Tasks:

1. List the entity types and their attributes. Mark the key, composite, and multivalued attributes.
2. List the relationship types with their cardinality ratios and participation constraints.
3. Draw the ER diagram.
4. Write down any assumptions you made.

### Exercise 2: Hospital

> A hospital has **departments**, each with a code and a name. **Doctors** (ID, name, specialty) belong to one department. **Patients** have an ID, a name, a date of birth, and an address (street, city). A patient may have several **visits**. Each visit is identified by the patient and a visit number, and records a date, a diagnosis, and the doctor who handled it. During a visit, a doctor can prescribe several **medicines** (code, name, unit price), each with a dosage.

Tasks: as in Exercise 1. In addition, identify the **weak entity type** and its partial key.

### Exercise 3: Critique

The following ER fragment has at least **four** design problems. Find and fix them.

- `STUDENT(StudentID, Name, DeptName, DeptBuilding, CourseList)`
- `COURSE(CourseID, Title, Grade)`
- Relationship `TAKES` between `STUDENT` and `COURSE`, 1:N.

---

## Part B – Mapping (session 2)

### Exercise 4

Map your bookstore ER diagram (Exercise 1) to a relational schema. For each relation:

- write it in the form `Relation(PK, attr, …, FK*)`;
- say which mapping step (1–7) produced it;
- list the referential integrity constraints as `FK → Relation(PK)`.

### Exercise 5

Map the hospital ER diagram (Exercise 2). Pay particular attention to the weak entity `VISIT` and to the prescription relationship.

### Exercise 6: Reverse engineering

Look at the tables in `UniversityDB` (see the script in [`database/university.sql`](database/university.sql)) and draw the ER diagram they came from. Identify:

1. which tables come from entity types and which come from M:N relationships;
2. how the 1:1 relationship *heads* was mapped;
3. the recursive relationship and its role names.

## Submission

Submit one PDF with the diagrams and the relational schemas.

Sample solutions: [`solutions/lab02-solution.md`](solutions/lab02-solution.md).

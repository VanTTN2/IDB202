# Chapter 7 – SQL: Data Modification, Views, and Indexes

**Learning outcomes:** CLO5

After studying this chapter, you should be able to:

- insert, update, and delete data, including with subqueries and joins;
- explain how constraints affect DML statements;
- create and use views, and state when a view is updatable;
- explain what an index is and when to create one.

**Readings:** [DSC] Ch. 3 (3.9), Ch. 4 (4.2), Ch. 14 (14.1–14.2, 14.9); [DMS] Ch. 3 (3.6), Ch. 8

---

## 7.1 INSERT

```sql
-- One row, with the column list (recommended)
INSERT INTO Department (DeptID, DeptName, Building, Budget)
VALUES ('AI', N'Artificial Intelligence', N'Alpha', 500000);

-- Several rows
INSERT INTO Course (CourseID, Title, Credits, DeptID) VALUES
('AIL303', N'Machine Learning', 3, 'AI'),
('AIP391', N'AI Project',       4, 'AI');

-- From a query
INSERT INTO Enrollment (StudentID, SectionID)
SELECT StudentID, 12
FROM   Student
WHERE  DeptID = 'CS' AND EnrollYear = 2025;

-- Get the IDENTITY value that was just generated
INSERT INTO Section (CourseID, Semester, Room) VALUES ('AIL303', 'FA2026', 'A401');
SELECT SCOPE_IDENTITY() AS NewSectionID;
```

Columns you leave out receive their `DEFAULT` value, or `NULL`. If the column is `NOT NULL` and has no default, the insert fails.

## 7.2 UPDATE

```sql
-- Give a 5% raise to the CS instructors
UPDATE Instructor
SET    Salary = Salary * 1.05
WHERE  DeptID = 'CS';

-- Update with a subquery
UPDATE Department
SET    Budget = Budget + 50000
WHERE  DeptID IN (SELECT DeptID FROM Student GROUP BY DeptID HAVING COUNT(*) >= 4);

-- Update with a join (T-SQL)
UPDATE e
SET    e.Grade = 0
FROM   Enrollment e
JOIN   Section s ON s.SectionID = e.SectionID
WHERE  s.Semester = 'SP2026' AND e.Grade IS NULL;
```

> **Always test the `WHERE` clause with a `SELECT` first.** An `UPDATE` without a `WHERE` clause changes every row in the table.

## 7.3 DELETE and TRUNCATE

```sql
DELETE FROM Enrollment WHERE Grade IS NULL AND SectionID = 13;

DELETE e
FROM   Enrollment e JOIN Section s ON e.SectionID = s.SectionID
WHERE  s.Semester = 'FA2025';

TRUNCATE TABLE Enrollment;   -- removes every row; minimal logging; resets IDENTITY
```

| `DELETE` | `TRUNCATE` |
|---|---|
| Can have `WHERE` | Removes every row |
| Fires `DELETE` triggers | Does not fire triggers |
| Logs each row | Logs page deallocations only (faster) |
| Allowed on a table referenced by an FK | **Not** allowed on a table referenced by an FK |

## 7.4 MERGE (upsert)

```sql
MERGE Enrollment AS tgt
USING (VALUES ('SE170001', 12, 8.5)) AS src (StudentID, SectionID, Grade)
   ON tgt.StudentID = src.StudentID AND tgt.SectionID = src.SectionID
WHEN MATCHED THEN UPDATE SET Grade = src.Grade
WHEN NOT MATCHED THEN INSERT (StudentID, SectionID, Grade)
                      VALUES (src.StudentID, src.SectionID, src.Grade);
```

## 7.5 The OUTPUT clause

```sql
DELETE FROM Enrollment
OUTPUT deleted.StudentID, deleted.SectionID
WHERE  Grade < 4;
```

## 7.6 Views

A **view** is a named query stored in the catalog. It is a *virtual table*: normally no data is stored, and the query runs each time the view is used.

```sql
CREATE VIEW vw_Transcript AS
SELECT s.StudentID, s.FullName, c.CourseID, c.Title, c.Credits,
       sec.Semester, e.Grade
FROM   Enrollment e
JOIN   Student s   ON s.StudentID = e.StudentID
JOIN   Section sec ON sec.SectionID = e.SectionID
JOIN   Course c    ON c.CourseID = sec.CourseID;
GO

SELECT * FROM vw_Transcript WHERE StudentID = 'SE170001';
```

### Why use views?

- **Simplicity:** complex joins are hidden behind a simple name.
- **Security:** users can be given access to the view instead of the base tables (column and row restrictions).
- **Logical data independence:** applications keep working when the base tables change.
- **Consistency:** a business calculation, such as GPA, is defined in one place.

### Updatable views

In SQL Server, you can modify data through a view when:

- the change affects **only one** base table;
- the columns being changed are plain columns: not aggregates, not computed, not under `DISTINCT`, `GROUP BY`, or `TOP` (without `WITH CHECK OPTION`), and not from set operations;
- every `NOT NULL` column without a default in the base table is provided, for inserts.

For other cases, use an `INSTEAD OF` trigger (Chapter 9).

### WITH CHECK OPTION

```sql
CREATE VIEW vw_CSStudents AS
SELECT StudentID, FullName, Gender, DateOfBirth, Email, DeptID, EnrollYear
FROM   Student
WHERE  DeptID = 'CS'
WITH CHECK OPTION;   -- rejects inserts or updates that would make a row disappear from the view
```

### Changing and dropping views

```sql
ALTER VIEW vw_CSStudents AS ...;
DROP VIEW IF EXISTS vw_CSStudents;
```

**Materialized views** store the query result physically. In SQL Server they are called *indexed views* (`WITH SCHEMABINDING` plus a unique clustered index).

## 7.7 Indexes

An **index** is an auxiliary structure, usually a **B+-tree**, that speeds up finding rows by the values of certain columns. Indexes play the same role as the index at the back of a book.

| Type (SQL Server) | Description |
|---|---|
| **Clustered** | The table's rows are stored in the index key order. There can be only **one** per table. Created automatically for the `PRIMARY KEY` by default. |
| **Non-clustered** | A separate structure that holds the key and a pointer to the row. Up to 999 per table. Created automatically for `UNIQUE` constraints. |
| **Composite** | Built on several columns. Column order matters (the left-most prefix rule). |
| **Covering** | Includes every column a query needs (`INCLUDE (...)`), so the table itself is not read. |

```sql
CREATE INDEX IX_Student_DeptID ON Student (DeptID);
CREATE INDEX IX_Enrollment_Section ON Enrollment (SectionID) INCLUDE (Grade);
CREATE UNIQUE INDEX UX_Instructor_Email ON Instructor (Email);
DROP INDEX IX_Student_DeptID ON Student;
```

### When to create an index

| Good candidates | Poor candidates |
|---|---|
| FK columns used in joins | Small tables |
| Columns used often in `WHERE`, `ORDER BY`, and `GROUP BY` | Columns with very few distinct values, such as `Gender` |
| Selective columns (many distinct values) | Tables with heavy `INSERT`/`UPDATE` traffic and few reads |

Indexes make **reads faster** but make **writes slower** and **use storage**. Use SSMS's *Include Actual Execution Plan* (Ctrl+M) to see whether a query does an *Index Seek* or a *Table/Index Scan*.

---

## Summary

- `INSERT`, `UPDATE`, `DELETE`, and `MERGE` modify data, and every constraint is checked on each statement.
- Views are stored queries that provide simplicity, security, and independence.
- Indexes speed up searches at the cost of slower writes and extra storage.

## Review questions

1. What happens when you delete a `Student` row that has enrollments, given the constraints in `UniversityDB`?
2. Explain the difference between `DELETE FROM T` and `TRUNCATE TABLE T`.
3. Is `vw_Transcript` updatable? Which column could you update through it?
4. What does `WITH CHECK OPTION` prevent? Give an example.
5. Why can a table have only one clustered index?

# Chapter 7 – SQL: Data Modification and Views

**Learning outcomes:** CLO5

After studying this chapter, you should be able to:

- insert, update, and delete data, including with subqueries and joins;
- explain how constraints affect DML statements;
- create and use views, and state when a view is updatable;
- use SQL from a Python program safely, with parameters.

**Readings:** [DSC] Ch. 3 (3.9), Ch. 4 (4.2), Ch. 9 (9.2); [DMS] Ch. 3 (3.6), Ch. 6 (6.1–6.2)

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

## 7.7 Using the database from Python

You are learning Python in PFP191 this semester, and later courses (DSI201 Data Science, DAM311 Data Mining) read their data from databases. A Python program talks to SQL Server through a **driver**, here `pyodbc`.

```python
# pip install pyodbc pandas
import pyodbc
import pandas as pd

conn = pyodbc.connect(
    "DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost;"
    "DATABASE=UniversityDB;UID=sa;PWD=YourStr0ng!Pass;TrustServerCertificate=yes"
)
cur = conn.cursor()

# Parameterized query: the ? placeholders are filled in safely by the driver
dept = "CS"
cur.execute("SELECT StudentID, FullName FROM Student WHERE DeptID = ?", dept)
for student_id, name in cur.fetchall():
    print(student_id, name)

# Modify data inside a transaction (pyodbc turns autocommit off by default)
cur.execute("UPDATE Enrollment SET Grade = ? WHERE StudentID = ? AND SectionID = ?",
            8.5, "SE170001", 11)
conn.commit()          # or conn.rollback()

# Load a query result into a pandas DataFrame for analysis
df = pd.read_sql("SELECT * FROM vw_Transcript", conn)
print(df.groupby("Semester")["Grade"].mean())

conn.close()
```

### SQL injection

**Never** build SQL by joining strings with user input:

```python
sid = input("Student ID: ")         # the user types:  x' OR '1'='1
cur.execute("SELECT * FROM Student WHERE StudentID = '" + sid + "'")   # DANGEROUS
```

The query becomes `... WHERE StudentID = 'x' OR '1'='1'` and returns **every** student. With parameters (`?`), the driver sends the value separately from the SQL text, so it can never change the meaning of the query. You will study this attack in more depth in DPY391 (Data Security and Privacy).

## 7.8 Looking ahead: indexes

Views change how data *looks* to users. They do not make queries faster. Speed comes from **indexes**, which Chapter 9 covers together with storage and query processing.


## 7.9 Views and query rewriting

When a query uses a view, the DBMS **substitutes** the view's definition into the query (*view expansion* or *unfolding*) and then optimizes the result as one query. A view therefore normally costs nothing extra.

**The view-update problem.** An update through a view must be translated into updates of the base tables. The translation can be **ambiguous**. For example, deleting a row from a join view could be done by deleting from either base table. It can also be **impossible**: an update of an aggregate such as `SET GPA = 10` has no unique translation. Deciding when a view update has a unique, side-effect-free translation is a classic research problem (Bancilhon and Spyratos, 1981; Dayal and Bernstein, 1982). SQL takes a conservative, syntactic approach: a view is updatable only if it satisfies the rules in §7.6.

## Research Corner

**Paper.** Bancilhon, F. and Spyratos, N. "Update Semantics of Relational Views." *ACM TODS* 6(4), 1981.

**Guiding questions**

1. What is a *complement* of a view, according to the paper?
2. Use a small example to show that deleting one row from `vw_Transcript` could be translated in two different ways. Which translation has fewer side effects?

---

## Summary

- `INSERT`, `UPDATE`, `DELETE`, and `MERGE` modify data, and every constraint is checked on each statement.
- Views are stored queries that provide simplicity, security, and independence.
- Python programs send SQL to the database through a driver. Always pass values as parameters, never by building strings.

## Review questions

1. What happens when you delete a `Student` row that has enrollments, given the constraints in `UniversityDB`?
2. Explain the difference between `DELETE FROM T` and `TRUNCATE TABLE T`.
3. Is `vw_Transcript` updatable? Which column could you update through it?
4. What does `WITH CHECK OPTION` prevent? Give an example.
5. Why is `"SELECT * FROM Student WHERE StudentID = '" + sid + "'"` dangerous in a Python program? How do you fix it?

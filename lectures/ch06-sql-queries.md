# Chapter 6 – SQL: Queries

**Learning outcomes:** CLO4

After studying this chapter, you should be able to:

- write single-table queries with filtering, sorting, and expressions;
- join several tables with inner, outer, and self joins;
- summarize data with `GROUP BY` and `HAVING`;
- use nested and correlated subqueries, `EXISTS`, and set operations;
- explain how `NULL` values behave.

**Readings:** [DSC] Ch. 3 (3.3–3.8), Ch. 4 (4.1); [DMS] Ch. 5 (5.1–5.6)

---

## 6.1 The SELECT statement

```sql
SELECT   [DISTINCT] [TOP (n)] column_list      -- 5
FROM     table_list                            -- 1
[WHERE   row_condition]                        -- 2
[GROUP BY grouping_columns]                    -- 3
[HAVING  group_condition]                      -- 4
[ORDER BY sort_list]                           -- 6
```

The numbers show the **logical processing order**. This order explains why a column alias defined in `SELECT` can be used in `ORDER BY` but **not** in `WHERE`.

## 6.2 Single-table queries

```sql
-- Projection, computed column, and alias
SELECT FullName, Salary, Salary * 12 AS AnnualSalary
FROM   Instructor;

-- Selection
SELECT * FROM Student WHERE DeptID = 'SE' AND EnrollYear >= 2024;

-- Remove duplicates
SELECT DISTINCT DeptID FROM Student;

-- Sort; TOP
SELECT TOP (3) FullName, Salary FROM Instructor ORDER BY Salary DESC;
SELECT TOP (3) WITH TIES FullName, Salary FROM Instructor ORDER BY Salary DESC;

-- Paging (SQL:2008 standard)
SELECT FullName FROM Student ORDER BY FullName
OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY;
```

### Predicates

| Predicate | Example |
|---|---|
| Comparison | `Salary >= 90000` |
| `BETWEEN a AND b` (inclusive) | `Grade BETWEEN 5 AND 8` |
| `IN (list)` | `DeptID IN ('CS','SE')` |
| `LIKE` pattern | `FullName LIKE N'Nguyen%'`, `CourseID LIKE '__D2%'` |
| `IS [NOT] NULL` | `AdvisorID IS NULL` |

In `LIKE`, `%` matches any string, `_` matches exactly one character, and `[a-c]` matches one character in a range (T-SQL).

### Useful built-in functions (T-SQL)

| Area | Functions |
|---|---|
| String | `LEN`, `UPPER`, `LOWER`, `LEFT`, `RIGHT`, `SUBSTRING`, `TRIM`, `CONCAT`, `REPLACE` |
| Date | `GETDATE()`, `YEAR`, `MONTH`, `DAY`, `DATEDIFF(unit, a, b)`, `DATEADD`, `FORMAT` |
| Conversion | `CAST(x AS type)`, `CONVERT(type, x)`, `TRY_CAST` |
| NULL handling | `ISNULL(x, y)`, `COALESCE(x, y, …)`, `NULLIF(a, b)` |
| Conditional | `CASE WHEN … THEN … ELSE … END`, `IIF(cond, a, b)` |

```sql
SELECT StudentID, SectionID, Grade,
       CASE WHEN Grade IS NULL THEN 'In progress'
            WHEN Grade >= 5    THEN 'Pass'
            ELSE 'Fail' END AS Result
FROM Enrollment;
```

## 6.3 NULL and three-valued logic

Any comparison with `NULL` gives **UNKNOWN**, and `WHERE` keeps only rows whose condition is **TRUE**.

| AND | TRUE | FALSE | UNKNOWN |
|---|---|---|---|
| **TRUE** | TRUE | FALSE | UNKNOWN |
| **FALSE** | FALSE | FALSE | FALSE |
| **UNKNOWN** | UNKNOWN | FALSE | UNKNOWN |

| OR | TRUE | FALSE | UNKNOWN |
|---|---|---|---|
| **TRUE** | TRUE | TRUE | TRUE |
| **FALSE** | TRUE | FALSE | UNKNOWN |
| **UNKNOWN** | TRUE | UNKNOWN | UNKNOWN |

`NOT UNKNOWN` = `UNKNOWN`.

> `WHERE AdvisorID = NULL` never returns any rows. Write `WHERE AdvisorID IS NULL`.

## 6.4 Joins

```sql
-- Inner join: students and the name of their major
SELECT s.StudentID, s.FullName, d.DeptName
FROM   Student s
JOIN   Department d ON s.DeptID = d.DeptID;

-- Multi-table join: transcript
SELECT s.FullName, c.Title, sec.Semester, e.Grade
FROM   Enrollment e
JOIN   Student s   ON e.StudentID = s.StudentID
JOIN   Section sec ON e.SectionID = sec.SectionID
JOIN   Course c    ON sec.CourseID = c.CourseID
ORDER BY s.FullName, sec.Semester;

-- Left outer join: every department and its instructors (a department with none appears once with NULLs)
SELECT d.DeptName, i.FullName
FROM   Department d
LEFT JOIN Instructor i ON i.DeptID = d.DeptID;

-- Anti-join pattern: courses that were never offered
SELECT c.CourseID, c.Title
FROM   Course c
LEFT JOIN Section sec ON sec.CourseID = c.CourseID
WHERE  sec.SectionID IS NULL;

-- Self join: students and their advisors
SELECT s.FullName AS Student, a.FullName AS Advisor
FROM   Student s
LEFT JOIN Instructor a ON s.AdvisorID = a.InstructorID;

-- Self join on Course through Prerequisite
SELECT c.Title AS Course, p.Title AS Prerequisite
FROM   Prerequisite pr
JOIN   Course c ON pr.CourseID = c.CourseID
JOIN   Course p ON pr.PrereqID = p.CourseID;
```

| Join | Returns |
|---|---|
| `[INNER] JOIN` | Only the rows that match |
| `LEFT [OUTER] JOIN` | Every row of the left table, plus matching rows (or `NULL`s) |
| `RIGHT [OUTER] JOIN` | Every row of the right table |
| `FULL [OUTER] JOIN` | Every row of both tables |
| `CROSS JOIN` | The Cartesian product |

> In a `LEFT JOIN`, a condition on the **right** table belongs in the `ON` clause. Putting it in `WHERE` turns the join back into an inner join.

## 6.5 Aggregation

| Function | Notes |
|---|---|
| `COUNT(*)` | Counts rows |
| `COUNT(col)` | Counts non-`NULL` values |
| `COUNT(DISTINCT col)` | Counts distinct non-`NULL` values |
| `SUM`, `AVG`, `MIN`, `MAX` | Ignore `NULL`s |

```sql
-- Number of instructors and average salary per department
SELECT   DeptID, COUNT(*) AS NumInstructors, AVG(Salary) AS AvgSalary
FROM     Instructor
GROUP BY DeptID
HAVING   COUNT(*) >= 2
ORDER BY AvgSalary DESC;
```

**The GROUP BY rule:** every column in `SELECT` must either appear in `GROUP BY` or be inside an aggregate function.

| `WHERE` | `HAVING` |
|---|---|
| Filters **rows** before grouping | Filters **groups** after grouping |
| Cannot contain aggregates | Usually contains aggregates |

```sql
-- GPA of each student over graded enrollments, weighted by credits
SELECT   s.StudentID, s.FullName,
         CAST(SUM(e.Grade * c.Credits) / SUM(c.Credits) AS DECIMAL(4,2)) AS GPA
FROM     Enrollment e
JOIN     Student s   ON s.StudentID = e.StudentID
JOIN     Section sec ON sec.SectionID = e.SectionID
JOIN     Course c    ON c.CourseID = sec.CourseID
WHERE    e.Grade IS NOT NULL
GROUP BY s.StudentID, s.FullName;
```

## 6.6 Subqueries

### Scalar subquery (returns one value)

```sql
SELECT FullName, Salary
FROM   Instructor
WHERE  Salary > (SELECT AVG(Salary) FROM Instructor);
```

### Multi-row subquery: `IN`, `ANY`, `ALL`

```sql
-- Students who have taken IDB201
SELECT FullName FROM Student
WHERE  StudentID IN (SELECT e.StudentID
                     FROM Enrollment e JOIN Section s ON e.SectionID = s.SectionID
                     WHERE s.CourseID = 'IDB201');

-- Instructors who earn more than every SE instructor
SELECT FullName, Salary FROM Instructor
WHERE  Salary > ALL (SELECT Salary FROM Instructor WHERE DeptID = 'SE');
```

> **The NOT IN trap:** if the subquery returns even one `NULL`, `x NOT IN (subquery)` is never TRUE, so the query returns no rows. Use `NOT EXISTS`, or filter out the `NULL`s.

### Correlated subqueries and EXISTS

A **correlated** subquery refers to the outer query, so it is evaluated once for each outer row.

```sql
-- Instructors who earn more than the average of their own department
SELECT i.FullName, i.DeptID, i.Salary
FROM   Instructor i
WHERE  i.Salary > (SELECT AVG(i2.Salary) FROM Instructor i2 WHERE i2.DeptID = i.DeptID);

-- Departments with no students
SELECT d.DeptName FROM Department d
WHERE NOT EXISTS (SELECT 1 FROM Student s WHERE s.DeptID = d.DeptID);
```

### Division in SQL ("for all")

Students who took **every** course offered by the MATH department:

```sql
SELECT s.StudentID, s.FullName
FROM   Student s
WHERE NOT EXISTS (
    SELECT c.CourseID FROM Course c
    WHERE  c.DeptID = 'MATH'
      AND NOT EXISTS (
          SELECT 1 FROM Enrollment e JOIN Section sec ON e.SectionID = sec.SectionID
          WHERE e.StudentID = s.StudentID AND sec.CourseID = c.CourseID));
```

Read it as: *there is no MATH course that the student has not taken.*

### Subqueries in FROM (derived tables) and CTEs

```sql
WITH DeptAvg AS (
    SELECT DeptID, AVG(Salary) AS AvgSal FROM Instructor GROUP BY DeptID
)
SELECT d.DeptName, da.AvgSal
FROM   DeptAvg da JOIN Department d ON d.DeptID = da.DeptID
WHERE  da.AvgSal = (SELECT MAX(AvgSal) FROM DeptAvg);
```

## 6.7 Set operations

```sql
SELECT StudentID FROM Enrollment WHERE SectionID = 5
UNION          -- UNION ALL keeps duplicates
SELECT StudentID FROM Enrollment WHERE SectionID = 6;

SELECT DeptID FROM Department
EXCEPT
SELECT DeptID FROM Course;        -- departments that offer no courses

SELECT DeptID FROM Student
INTERSECT
SELECT DeptID FROM Instructor;
```

The queries being combined must have the same number of columns, with compatible types.

## 6.8 Window functions (preview)

```sql
SELECT FullName, DeptID, Salary,
       RANK() OVER (PARTITION BY DeptID ORDER BY Salary DESC) AS RankInDept
FROM   Instructor;
```


## 6.9 Semantics of SQL

### From SQL to relational algebra

A basic query

```sql
SELECT DISTINCT A1, …, Ak
FROM   R1, …, Rm
WHERE  C
```

means `π A1,…,Ak ( σ C ( R1 × … × Rm ) )`. Without `DISTINCT`, the projection keeps duplicates: SQL works on **bags** (multisets), not sets.

### Bag semantics

| Operation | Set semantics | Bag semantics (SQL) |
|---|---|---|
| R ∪ S | each tuple once | `UNION` removes duplicates; `UNION ALL` gives count_R(t) + count_S(t) |
| R ∩ S | | `INTERSECT` removes duplicates (the standard also has `INTERSECT ALL`: min of the counts) |
| R − S | | `EXCEPT` removes duplicates (the standard also has `EXCEPT ALL`: max(count_R − count_S, 0)) |

**Exercise.** Show that under bag semantics, `R ∪ R ≠ R` in general, while the equation always holds under set semantics. Which algebraic laws that you know from sets (MAD102) *fail* for bags?

### Three-valued logic, formally

SQL logic has the truth values {T, F, U} with the order F < U < T:

- `x AND y = min(x, y)`, `x OR y = max(x, y)`, and NOT swaps T and F and leaves U unchanged.
- `WHERE` keeps a row only if its condition is **T**.

**Consequences worth proving:**

1. `p OR NOT p` is not always true: it is U when p is U. The law of excluded middle fails.
2. `x NOT IN (1, 2, NULL)` is never T.
3. `SELECT COUNT(*) FROM T WHERE c` + `SELECT COUNT(*) FROM T WHERE NOT c` can be smaller than `SELECT COUNT(*) FROM T`.

## Research Corner

**Paper.** Chamberlin, D. D. and Boyce, R. F. "SEQUEL: A Structured English Query Language." *Proceedings of the ACM SIGFIDET Workshop*, 1974.

**Further reading.** Guagliardo, P. and Libkin, L. "A Formal Semantics of SQL Queries, Its Validation, and Applications." *PVLDB* 11(1), 2017.

**Guiding questions**

1. SEQUEL was designed for "users who are not computer specialists." Which features of today's SQL come from that goal, and which features make SQL hard for specialists?
2. Guagliardo and Libkin found that the formal semantics of SQL was not settled until 2017, more than 40 years after SQL was designed. Why is it hard to define SQL formally? (Hint: `NULL`, bags, and correlated subqueries.)

---

## Summary

- Know the logical processing order: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY.
- Use inner joins for matches, outer joins to keep unmatched rows, and self joins for recursive relationships.
- `NULL` makes conditions UNKNOWN. Use `IS NULL`, and be careful with `NOT IN`.
- Write "for all" queries with double `NOT EXISTS`.

## Review questions

1. Why is `SELECT DeptID, FullName, COUNT(*) FROM Instructor GROUP BY DeptID` invalid?
2. Rewrite the anti-join query "courses never offered" in two other ways.
3. What is the difference between `COUNT(*)` and `COUNT(AdvisorID)` on `Student`?
4. When does `NOT IN` give a different result from `NOT EXISTS`?
5. Write a query that lists each semester with its number of sections and number of enrollments.

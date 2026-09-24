# Lab 8 – Indexing, Query Plans, and Transactions

**Chapters:** 9, 10 · **Duration:** 2 lab sessions · **CLOs:** CLO7, CLO8

## Objectives

- Measure the effect of indexes on query cost using execution plans and `STATISTICS IO`.
- Choose indexes for a workload of queries.
- Use transactions with `TRY…CATCH`.
- Reproduce concurrency anomalies with two sessions and prevent them with isolation levels.

Run [`database/university.sql`](database/university.sql) again first.

---

## Part A – A bigger table

The sample database is too small for indexes to make a visible difference. Run the script below to create `BigEnrollment`, a table of about 500,000 generated rows.

```sql
USE UniversityDB;
DROP TABLE IF EXISTS BigEnrollment;
CREATE TABLE BigEnrollment (
    ID         INT IDENTITY PRIMARY KEY,
    StudentID  CHAR(8)      NOT NULL,
    CourseID   CHAR(6)      NOT NULL,
    Semester   CHAR(6)      NOT NULL,
    Grade      DECIMAL(4,2) NULL,
    EnrollDate DATE         NOT NULL
);

WITH N AS (
    SELECT TOP (500000) ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
    FROM sys.all_objects a CROSS JOIN sys.all_objects b
)
INSERT INTO BigEnrollment (StudentID, CourseID, Semester, Grade, EnrollDate)
SELECT 'ST' + RIGHT('000000' + CAST(n % 50000 AS VARCHAR(6)), 6),
       CHOOSE(n % 8 + 1, 'PRF192','MAD101','CSD201','IDB202','PRO192','SWE201','ECO111','MAS291'),
       CHOOSE(n % 6 + 1, 'FA2023','SP2024','FA2024','SP2025','FA2025','SP2026'),
       CAST((n * 7919) % 1001 / 100.0 AS DECIMAL(4,2)),
       DATEADD(DAY, n % 1000, '2023-09-01')
FROM N;
```

## Part B – Indexes and execution plans

Turn on **Include Actual Execution Plan** (Ctrl+M) and run `SET STATISTICS IO ON;`. For each question, record the plan operators and the number of **logical reads**.

1. Run `SELECT * FROM BigEnrollment WHERE StudentID = 'ST012345';`. Which operator appears? How many logical reads are there?
2. Create an index on `StudentID` and run the query again. Compare the operators and the logical reads. Explain the **Key Lookup** operator.
3. Change the query to `SELECT StudentID, Grade FROM BigEnrollment WHERE StudentID = 'ST012345';`. Create a **covering index** that removes the Key Lookup, and prove that it does.
4. Create a composite index on (`CourseID`, `Semester`). Which of these queries can **seek** on it? Explain using the left-most prefix rule.
   - `WHERE CourseID = 'IDB202'`
   - `WHERE CourseID = 'IDB202' AND Semester = 'SP2026'`
   - `WHERE Semester = 'SP2026'`
5. Compare `WHERE YEAR(EnrollDate) = 2024` with `WHERE EnrollDate >= '2024-01-01' AND EnrollDate < '2025-01-01'` after creating an index on `EnrollDate`. Which query can seek? Why?
6. Measure how long it takes to insert 10,000 rows with no secondary indexes, and then with 4 secondary indexes. What does this show about the cost of indexes?
7. **Index design.** An application runs the four queries below very often. Propose at most three indexes for them and justify each one.
   - the transcript of one student;
   - the number of students per course per semester;
   - the list of failing grades (< 5) in a given semester;
   - the average grade of one course.

## Part C – Transactions

8. Write a transaction that moves student `'SE170003'` from section 5 to section 6, using `TRY…CATCH` and `XACT_ABORT ON`. Test it once when it succeeds. Then test it when it fails, by changing the insert to use a section that does not exist, and show that the delete was rolled back.
9. Use a savepoint: within one transaction, raise every CS salary by 5% and create a savepoint, then raise every SE salary by 5% and roll back to the savepoint, then commit. Check which salaries changed.

## Part D – Concurrency (two query windows)

Open **two** query windows in SSMS, *Session 1* and *Session 2*, both connected to `UniversityDB`.

10. **Dirty read.**
    - Session 1: `BEGIN TRAN; UPDATE Department SET Budget = 0 WHERE DeptID = 'CS';` (do not commit)
    - Session 2: `SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED; SELECT Budget FROM Department WHERE DeptID = 'CS';`
    - Session 1: `ROLLBACK;`
    - Explain what Session 2 saw. Repeat the steps with `READ COMMITTED` in Session 2. What happens now?
11. **Non-repeatable read.** Reproduce it at `READ COMMITTED`, then show that `REPEATABLE READ` prevents it.
12. **Phantom.** Session 1 counts the enrollments in section 12 twice inside one transaction, while Session 2 inserts a new enrollment in between. Show the anomaly at `REPEATABLE READ` and show that `SERIALIZABLE` prevents it.
13. **Deadlock.** Session 1 updates department CS and then IA. Session 2 updates IA and then CS, in the interleaved order. Which session receives error 1205? How would you rewrite the transactions to avoid the deadlock?

## Submission

Submit `lab08_<StudentID>.sql` with your queries, and a short report (PDF) with screenshots of the execution plans and your answers.

Sample solutions: [`solutions/lab08-solution.sql`](solutions/lab08-solution.sql).

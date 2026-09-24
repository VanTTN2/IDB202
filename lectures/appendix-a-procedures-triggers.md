# Appendix A – Stored Procedures, Functions, and Triggers (Optional)

**Status:** optional enrichment. This material is not part of the official course description and is not assessed in the exams. It is useful for the group project.

After studying this chapter, you should be able to:

- use T-SQL variables, control flow, and error handling;
- write stored procedures with input and output parameters;
- write scalar and table-valued user-defined functions;
- write `AFTER` and `INSTEAD OF` triggers that use the `inserted` and `deleted` tables;
- choose between a constraint, a procedure, a function, and a trigger.

**Readings:** [DSC] Ch. 5 (5.2–5.3); [DMS] Ch. 5 (5.8–5.9), Ch. 6 (6.5)

> **Note for first-year students:** this appendix is your first taste of programming *inside* the database. You only need the basic ideas of variables, `IF`, and loops. Every example is short and builds on SQL you already know.

---

## 9.1 T-SQL programming basics

```sql
DECLARE @dept CHAR(4) = 'CS',
        @count INT;

SELECT @count = COUNT(*) FROM Student WHERE DeptID = @dept;

IF @count > 3
    PRINT CONCAT('Department ', @dept, ' has ', @count, ' students');
ELSE
BEGIN
    PRINT 'Small department';
END;

-- Loop
DECLARE @i INT = 1;
WHILE @i <= 3
BEGIN
    PRINT @i;
    SET @i += 1;
END;
```

### Error handling

```sql
BEGIN TRY
    INSERT INTO Course (CourseID, Title, Credits, DeptID)
    VALUES ('BAD001', N'Invalid', 10, 'CS');     -- violates CK_Course_Credits
END TRY
BEGIN CATCH
    PRINT CONCAT('Error ', ERROR_NUMBER(), ': ', ERROR_MESSAGE());
END CATCH;

-- Raise your own error
THROW 50001, 'Section is full.', 1;
```

## 9.2 Stored procedures

A **stored procedure** is a named, precompiled batch of T-SQL statements stored in the database.

**Benefits:** code can be reused, there are fewer network round trips, execution plans are reused, access is secure (users get `EXECUTE` permission instead of table access), and dynamic SQL is avoided, which protects against SQL injection.

```sql
CREATE OR ALTER PROCEDURE usp_GetTranscript
    @StudentID CHAR(8)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT c.CourseID, c.Title, c.Credits, sec.Semester, e.Grade
    FROM   Enrollment e
    JOIN   Section sec ON sec.SectionID = e.SectionID
    JOIN   Course c    ON c.CourseID = sec.CourseID
    WHERE  e.StudentID = @StudentID
    ORDER BY sec.Semester, c.CourseID;
END;
GO

EXEC usp_GetTranscript @StudentID = 'SE170001';
```

### Output parameters and return codes

```sql
CREATE OR ALTER PROCEDURE usp_EnrollStudent
    @StudentID CHAR(8),
    @SectionID INT,
    @Message   NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Student WHERE StudentID = @StudentID)
    BEGIN
        SET @Message = N'Student not found.';
        RETURN 1;
    END;

    DECLARE @capacity SMALLINT, @enrolled INT;
    SELECT @capacity = Capacity FROM Section WHERE SectionID = @SectionID;
    IF @capacity IS NULL
    BEGIN
        SET @Message = N'Section not found.';
        RETURN 2;
    END;

    SELECT @enrolled = COUNT(*) FROM Enrollment WHERE SectionID = @SectionID;
    IF @enrolled >= @capacity
    BEGIN
        SET @Message = N'Section is full.';
        RETURN 3;
    END;

    INSERT INTO Enrollment (StudentID, SectionID) VALUES (@StudentID, @SectionID);
    SET @Message = N'Enrolled successfully.';
    RETURN 0;
END;
GO

DECLARE @msg NVARCHAR(200), @rc INT;
EXEC @rc = usp_EnrollStudent 'MA190013', 12, @msg OUTPUT;
SELECT @rc AS ReturnCode, @msg AS Message;
```

> When two users run this procedure at the same moment, both can see a free seat and both can enroll, overfilling the section. Chapter 10 shows how a transaction and locking fix this problem.

## 9.3 User-defined functions (UDFs)

| Kind | Returns | Used in |
|---|---|---|
| Scalar | One value | `SELECT` lists and `WHERE` clauses |
| Inline table-valued (iTVF) | A table defined by a single `SELECT` | `FROM` (like a view with parameters) |
| Multi-statement table-valued | A table variable filled by several statements | `FROM` |

```sql
-- Scalar function: weighted GPA
CREATE OR ALTER FUNCTION fn_GPA (@StudentID CHAR(8))
RETURNS DECIMAL(4,2)
AS
BEGIN
    DECLARE @gpa DECIMAL(4,2);
    SELECT @gpa = SUM(e.Grade * c.Credits) / NULLIF(SUM(c.Credits), 0)
    FROM   Enrollment e
    JOIN   Section sec ON sec.SectionID = e.SectionID
    JOIN   Course c    ON c.CourseID = sec.CourseID
    WHERE  e.StudentID = @StudentID AND e.Grade IS NOT NULL;
    RETURN @gpa;
END;
GO

SELECT StudentID, FullName, dbo.fn_GPA(StudentID) AS GPA FROM Student;

-- Inline table-valued function: sections in a semester
CREATE OR ALTER FUNCTION fn_SectionsInSemester (@Semester CHAR(6))
RETURNS TABLE
AS
RETURN (
    SELECT sec.SectionID, c.Title, i.FullName AS Instructor, sec.Room
    FROM   Section sec
    JOIN   Course c ON c.CourseID = sec.CourseID
    LEFT JOIN Instructor i ON i.InstructorID = sec.InstructorID
    WHERE  sec.Semester = @Semester
);
GO

SELECT * FROM dbo.fn_SectionsInSemester('SP2026');
```

**Procedure versus function:**

| | Procedure | Function |
|---|---|---|
| Called with | `EXEC` | Inside a query |
| Can modify data | Yes | **No** (no side effects) |
| Returns | Result sets, `OUTPUT` parameters, a return code | A value or a table |
| `TRY…CATCH`, transactions | Yes | No |

## 9.4 Triggers

A **trigger** is a procedure that runs **automatically** when a DML event (`INSERT`, `UPDATE`, or `DELETE`) happens on a table or view.

- `AFTER` (also written `FOR`) triggers run after the statement and after the constraints are checked. They are allowed only on tables.
- `INSTEAD OF` triggers run **in place of** the statement. They are allowed on tables and views.
- Triggers fire **once per statement**, not once per row. Inside a trigger, the pseudo-tables **`inserted`** and **`deleted`** hold the affected rows.

| Event | `inserted` holds | `deleted` holds |
|---|---|---|
| INSERT | the new rows | — |
| DELETE | — | the old rows |
| UPDATE | the new versions of the rows | the old versions of the rows |

### Example 1: enforce capacity (a rule that CHECK cannot express)

```sql
CREATE OR ALTER TRIGGER trg_Enrollment_Capacity
ON Enrollment
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM   Section s
        JOIN   (SELECT DISTINCT SectionID FROM inserted) i ON i.SectionID = s.SectionID
        WHERE  (SELECT COUNT(*) FROM Enrollment e WHERE e.SectionID = s.SectionID) > s.Capacity
    )
    BEGIN
        ROLLBACK TRANSACTION;
        THROW 50010, 'Section capacity exceeded.', 1;
    END;
END;
```

The trigger handles **multi-row** inserts correctly because it joins with `inserted` instead of reading a single variable.

### Example 2: audit trail

```sql
CREATE TABLE GradeAudit (
    AuditID   INT IDENTITY PRIMARY KEY,
    StudentID CHAR(8), SectionID INT,
    OldGrade  DECIMAL(4,2), NewGrade DECIMAL(4,2),
    ChangedBy SYSNAME DEFAULT SUSER_SNAME(),
    ChangedAt DATETIME2 DEFAULT SYSDATETIME()
);
GO

CREATE OR ALTER TRIGGER trg_Enrollment_GradeAudit
ON Enrollment
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(Grade)
        INSERT INTO GradeAudit (StudentID, SectionID, OldGrade, NewGrade)
        SELECT d.StudentID, d.SectionID, d.Grade, i.Grade
        FROM   deleted d
        JOIN   inserted i ON i.StudentID = d.StudentID AND i.SectionID = d.SectionID
        WHERE  ISNULL(d.Grade, -1) <> ISNULL(i.Grade, -1);
END;
```

### Example 3: INSTEAD OF trigger on a view

```sql
CREATE OR ALTER TRIGGER trg_vwTranscript_Delete
ON vw_Transcript
INSTEAD OF DELETE
AS
BEGIN
    DELETE e
    FROM   Enrollment e
    JOIN   Section sec ON sec.SectionID = e.SectionID
    JOIN   deleted d   ON d.StudentID = e.StudentID
                      AND d.CourseID = sec.CourseID
                      AND d.Semester = sec.Semester;
END;
```

### Managing triggers

```sql
DISABLE TRIGGER trg_Enrollment_Capacity ON Enrollment;
ENABLE  TRIGGER trg_Enrollment_Capacity ON Enrollment;
DROP TRIGGER IF EXISTS trg_Enrollment_Capacity;
```

## 9.5 Choosing the right tool

| Requirement | Best tool |
|---|---|
| Value range, not null, uniqueness, FK | **Declarative constraint** (fastest and most reliable) |
| Rule involving several rows or tables (capacity, salary limits) | **Trigger** |
| Multi-step business operation (enroll, transfer) | **Stored procedure** with a transaction |
| Reusable calculation in queries | **Function** |
| Audit and history | **Trigger** (or SQL Server temporal tables) |

Use triggers sparingly. They are hidden logic, can chain into other triggers, and make debugging harder.

---

## Summary

- Stored procedures package business operations and can use parameters, control flow, and error handling.
- Functions return values or tables and must not modify data.
- Triggers react automatically to DML events. They use `inserted` and `deleted`, and must handle multi-row statements.

## Review questions

1. List three benefits of stored procedures.
2. Why can a function not contain `INSERT INTO Student`?
3. What do `inserted` and `deleted` contain during an `UPDATE`?
4. Why must a trigger be written to handle multi-row statements? Give an example of a trigger that fails with a multi-row insert.
5. Should "grade between 0 and 10" be a `CHECK` constraint or a trigger? Why?

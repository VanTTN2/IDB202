# Chapter 5 – SQL: Data Definition and Constraints

**Learning outcomes:** CLO3, CLO5

After studying this chapter, you should be able to:

- create and drop databases and tables in T-SQL;
- choose appropriate SQL Server data types;
- declare `PRIMARY KEY`, `UNIQUE`, `NOT NULL`, `DEFAULT`, `CHECK`, and `FOREIGN KEY` constraints;
- choose referential actions (`CASCADE`, `SET NULL`, …);
- change existing tables with `ALTER TABLE`.

**Readings:** [DSC] Ch. 3 (3.1–3.2), Ch. 4 (4.4–4.5); [DMS] Ch. 3 (3.2–3.3), Ch. 5 (5.7)

---

## 5.1 SQL overview

SQL (Structured Query Language) was developed at IBM in the 1970s and has been standardized by ANSI and ISO since 1986 (SQL-86, SQL-92, SQL:1999 … SQL:2023). Every DBMS adds its own extensions. **T-SQL** is the dialect used by Microsoft SQL Server.

| Relational term | SQL term |
|---|---|
| Relation | Table |
| Tuple | Row |
| Attribute | Column |

## 5.2 Databases and schemas

```sql
CREATE DATABASE UniversityDB;
GO
USE UniversityDB;
GO
CREATE SCHEMA hr;          -- a namespace inside the database (the default is dbo)
GO
DROP DATABASE UniversityDB;
```

`GO` is not a T-SQL statement. It is a **batch separator** understood by SSMS and `sqlcmd`.

## 5.3 SQL Server data types

| Category | Types | Notes |
|---|---|---|
| Exact numbers | `INT`, `BIGINT`, `SMALLINT`, `TINYINT`, `DECIMAL(p,s)`, `NUMERIC(p,s)` | Use `DECIMAL` for money and grades |
| Approximate numbers | `FLOAT`, `REAL` | May have rounding errors, so never use them for money |
| Character strings | `CHAR(n)`, `VARCHAR(n)`, `VARCHAR(MAX)` | Fixed-length versus variable-length |
| Unicode strings | `NCHAR(n)`, `NVARCHAR(n)` | Needed for Vietnamese and other non-Latin text. Literals are written `N'...'` |
| Date and time | `DATE`, `TIME`, `DATETIME2`, `DATETIMEOFFSET` | Prefer `DATETIME2` to `DATETIME` |
| Other | `BIT`, `UNIQUEIDENTIFIER`, `VARBINARY` | `BIT` stores 0/1 (boolean) |

## 5.4 CREATE TABLE

```sql
CREATE TABLE Course (
    CourseID  CHAR(6)       NOT NULL,
    Title     NVARCHAR(80)  NOT NULL,
    Credits   TINYINT       NOT NULL,
    DeptID    CHAR(4)       NOT NULL,
    CONSTRAINT PK_Course PRIMARY KEY (CourseID),
    CONSTRAINT CK_Course_Credits CHECK (Credits BETWEEN 1 AND 6),
    CONSTRAINT FK_Course_Department FOREIGN KEY (DeptID)
        REFERENCES Department (DeptID)
);
```

**Name your constraints**, e.g. `PK_Course` or `FK_Course_Department`. Named constraints produce readable error messages and are easy to drop later.

## 5.5 Constraints

| Constraint | Purpose | Column-level example | Table-level example |
|---|---|---|---|
| `NOT NULL` | Value is required | `FullName NVARCHAR(60) NOT NULL` | — |
| `PRIMARY KEY` | Entity integrity: unique and not null | `DeptID CHAR(4) PRIMARY KEY` | `PRIMARY KEY (StudentID, SectionID)` |
| `UNIQUE` | Alternate key; allows **one** `NULL` in SQL Server | `Email VARCHAR(80) UNIQUE` | `UNIQUE (CourseID, Semester, Room)` |
| `DEFAULT` | Value used when none is given | `Budget DECIMAL(12,2) DEFAULT 0` | — |
| `CHECK` | Domain or business rule for a row | `CHECK (Grade BETWEEN 0 AND 10)` | `CHECK (EndDate >= StartDate)` |
| `FOREIGN KEY` | Referential integrity | `DeptID CHAR(4) REFERENCES Department(DeptID)` | `FOREIGN KEY (DeptID) REFERENCES Department(DeptID)` |

A composite key **must** be declared at table level.

### Referential actions

```sql
CONSTRAINT FK_Enrollment_Student FOREIGN KEY (StudentID)
    REFERENCES Student (StudentID)
    ON DELETE CASCADE
    ON UPDATE NO ACTION
```

| Action | Effect when the referenced row is deleted or updated |
|---|---|
| `NO ACTION` (default) | The statement is rejected with an error |
| `CASCADE` | Referencing rows are deleted, or their FK is updated |
| `SET NULL` | The FK is set to `NULL` (the column must allow `NULL`) |
| `SET DEFAULT` | The FK is set to its default value |

> SQL Server rejects a `CASCADE` configuration that could create **multiple cascade paths** or cycles. Use `NO ACTION` together with a trigger in those cases.

### IDENTITY (surrogate keys)

```sql
SectionID INT IDENTITY(1,1) PRIMARY KEY   -- seed 1, increment 1
```

To insert explicit values into an identity column, turn on `SET IDENTITY_INSERT Section ON` first.

## 5.6 ALTER TABLE and DROP TABLE

```sql
ALTER TABLE Student ADD Phone VARCHAR(15) NULL;
ALTER TABLE Student ALTER COLUMN Phone VARCHAR(20) NULL;
ALTER TABLE Student DROP COLUMN Phone;

ALTER TABLE Department ADD CONSTRAINT FK_Department_Head
    FOREIGN KEY (HeadID) REFERENCES Instructor (InstructorID);
ALTER TABLE Department DROP CONSTRAINT FK_Department_Head;

ALTER TABLE Instructor NOCHECK CONSTRAINT CK_Instructor_Salary;  -- disable
ALTER TABLE Instructor WITH CHECK CHECK CONSTRAINT CK_Instructor_Salary; -- re-enable and re-validate

DROP TABLE IF EXISTS Enrollment;   -- drop referencing tables first
```

**Circular foreign keys** (`Department.HeadID → Instructor`, `Instructor.DeptID → Department`): create both tables first, then add the second FK with `ALTER TABLE`. This is how `labs/database/university.sql` does it.

## 5.7 Order of creation and deletion

- **Create** parent tables before child tables: `Department → Instructor → Student → Course → Section → Enrollment`.
- **Drop** tables in the reverse order, or drop the FK constraints first.

## 5.8 Viewing the catalog

```sql
EXEC sp_help 'Enrollment';
SELECT * FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = 'Enrollment';
SELECT name, type_desc FROM sys.objects WHERE parent_object_id = OBJECT_ID('Enrollment');
```

## 5.9 Security (DCL) basics

```sql
CREATE LOGIN ta_user WITH PASSWORD = 'Str0ng!Passw0rd';
CREATE USER ta_user FOR LOGIN ta_user;
GRANT SELECT ON dbo.Student TO ta_user;
GRANT SELECT, UPDATE (Grade) ON dbo.Enrollment TO ta_user;
REVOKE UPDATE ON dbo.Enrollment FROM ta_user;
```

---

## Summary

- DDL statements (`CREATE`, `ALTER`, `DROP`) define the schema. Constraints enforce integrity inside the DBMS instead of in application code.
- Choose data types carefully: `NVARCHAR` for Unicode text, `DECIMAL` for exact numbers, `DATE`/`DATETIME2` for time values.
- Referential actions decide what happens to child rows when a parent row changes.

## Review questions

1. What is the difference between `CHAR(10)` and `VARCHAR(10)`? When would you use `NVARCHAR`?
2. Why should constraints be named?
3. Write a `CREATE TABLE` statement for `Room(Building, RoomNo, Capacity)` in which the key is (`Building`, `RoomNo`) and the capacity is between 10 and 300.
4. Explain the difference between `ON DELETE CASCADE` and `ON DELETE SET NULL` for `Section.InstructorID`. Which one is correct for this column, and why?
5. How do you create two tables that reference each other?

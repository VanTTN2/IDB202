# Lab 1 – Setting Up SQL Server and Exploring UniversityDB

**Chapter:** 1 · **Duration:** 3 hours · **CLOs:** CLO1

## Objectives

- Install SQL Server and a client tool.
- Create the sample database `UniversityDB` from a script.
- Explore the tables, columns, and data, and run your first queries.

## Part A – Installation (45 minutes)

1. Download **SQL Server 2022 Developer** or **Express** from https://www.microsoft.com/sql-server/sql-server-downloads and choose the *Basic* installation.
2. Install **SQL Server Management Studio (SSMS)** from https://aka.ms/ssmsfullsetup. On macOS or Linux, install **Azure Data Studio** and run SQL Server in Docker instead:
   ```bash
   docker run -e "ACCEPT_EULA=Y" -e "MSSQL_SA_PASSWORD=YourStr0ng!Pass" \
     -p 1433:1433 --name sql1 -d mcr.microsoft.com/mssql/server:2022-latest
   ```
3. Connect to the server: *Server name* = `localhost` (or `.\SQLEXPRESS`), with Windows Authentication or the `sa` login.

## Part B – Create the sample database (15 minutes)

1. Open [`database/university.sql`](database/university.sql) in SSMS (**File → Open → File…**).
2. Press **F5** to run it. The message `UniversityDB created successfully.` should appear.
3. In *Object Explorer*, right-click **Databases → Refresh** and expand **UniversityDB → Tables**.

## Part C – Explore the database (60 minutes)

Write down your answers in a file named `lab01_<StudentID>.sql`, and put each answer in a comment.

1. List the tables in `UniversityDB`. How many are there?
   ```sql
   SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE';
   ```
2. Show the columns and data types of the `Student` table.
   ```sql
   EXEC sp_help 'Student';
   ```
3. Display every row of `Department`. Which department has no building?
4. How many rows does each table have? (Hint: `SELECT COUNT(*) FROM <table>`.)
5. Use **Database Diagrams** in SSMS (right-click → *New Database Diagram*) to draw every table. Take a screenshot. Which tables reference `Instructor`?
6. For each of these terms, point to one concrete example in `UniversityDB`: *schema*, *instance*, *metadata*, *primary key*, *foreign key*.

## Part D – First queries (45 minutes)

Run each statement below and describe in one sentence what it does.

```sql
SELECT * FROM Course;
SELECT FullName, Email FROM Student;
SELECT * FROM Student WHERE DeptID = 'CS';
SELECT * FROM Instructor ORDER BY Salary DESC;
SELECT COUNT(*) FROM Enrollment;
```

Then try these two statements, which fail. Read each error message and explain which constraint stopped them.

```sql
INSERT INTO Course (CourseID, Title, Credits, DeptID) VALUES ('TST101', N'Test', 9, 'CS');
INSERT INTO Student (StudentID, FullName, Gender, DateOfBirth, Email, DeptID, EnrollYear)
VALUES ('SE999999', N'Test', 'M', '2007-01-01', 'an.nv@stu.uni.edu', 'SE', 2025);
```

## Submission

Submit `lab01_<StudentID>.sql` and the diagram screenshot before the end of the session.

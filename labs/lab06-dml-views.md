# Lab 6 – Data Modification, Views, and SQL from Python

**Chapter:** 7 · **Duration:** 1 lab session · **CLOs:** CLO4

## Objectives

- Insert, update, and delete data safely, and observe how constraints react.
- Create views and use them to query and modify data.
- Connect to the database from Python, run parameterized queries, and load results into pandas.

Run [`database/university.sql`](database/university.sql) again first. Save the SQL part as `lab06_<StudentID>.sql` and the Python part as `lab06_<StudentID>.py`.

---

## Part A – Data modification

1. Add a new department `('AI', N'Artificial Intelligence', N'Alpha', 700000)` and a new instructor who belongs to it.
2. Add a new course `'AIL303'` (*Machine Learning*, 3 credits, department `'AI'`) with prerequisites `'PRF192'` and `'MAD101'`.
3. Open a new section of `'AIL303'` in `'FA2026'`, taught by the instructor from question 1. Show the generated `SectionID` using `SCOPE_IDENTITY()`.
4. Enroll every CS student who entered in 2024 or 2025 in that section, using a single `INSERT … SELECT`.
5. Give a 3% raise to every instructor who teaches at least one section in `'SP2026'`.
6. Set the grade to `0` for every `'SP2026'` enrollment that has no grade (use `UPDATE … FROM … JOIN`).
7. Delete every enrollment with a grade below 4. Use the `OUTPUT` clause to display the deleted rows.
8. Try to delete the department `'CS'`. What happens, and why? Which constraint stops you?
9. Delete the student `'IA180008'`. What happens to their enrollments, and why?

> **Safety habit:** before every `UPDATE` or `DELETE`, first run a `SELECT` with the same `WHERE` clause and check which rows it returns.

## Part B – Views

10. Create the view `vw_Transcript` (student ID, name, course ID, title, credits, semester, grade).
11. Create the view `vw_StudentGPA` (student ID, name, department, GPA, total credits earned). Credits count only when the grade is ≥ 5.
12. Using `vw_StudentGPA`, list the students on the "Dean's list" (GPA ≥ 8).
13. Create the view `vw_SEStudents` with every column of `Student` for the SE department, using `WITH CHECK OPTION`. Then:
    - insert a new SE student through the view, which succeeds;
    - try to insert a CS student through the view, which fails. Explain why.
14. Try to `UPDATE vw_StudentGPA SET GPA = 10`. Why does it fail?

## Part C – SQL from Python

Install the drivers: `pip install pyodbc pandas`. You also need the Microsoft **ODBC Driver 18 for SQL Server**.

15. Write a Python script that connects to `UniversityDB` and prints the number of rows in each table.
16. Write a function `get_transcript(student_id)` that returns the student's transcript as a list of tuples. It must use a **parameterized** query.
17. Write a function `set_grade(student_id, section_id, grade)` that updates one grade and commits. If the update violates a constraint (for example, a grade of 11), it must roll back and print the error.
18. Load `vw_StudentGPA` into a pandas DataFrame and print the average GPA of each department.
19. Show, with a concrete input, how building the SQL string by concatenation lets a user read **all** students. Then fix the code.

Sample solutions: [`solutions/lab06-solution.sql`](solutions/lab06-solution.sql) and [`solutions/lab06-solution.py`](solutions/lab06-solution.py).

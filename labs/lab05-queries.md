# Lab 5 – SQL Queries

**Chapter:** 6 · **Duration:** 2 lab sessions · **CLOs:** CLO4

## Objectives

- Write queries against `UniversityDB` using filtering, joins, grouping, subqueries, and set operations.
- Check that your results are correct by reasoning about the data.

Run [`database/university.sql`](database/university.sql) again before you start so that the data is in its original state. Save your answers in `lab05_<StudentID>.sql`, with the question number in a comment above each query.

---

## Part A – Single-table queries and joins

**Single table**

1. List all courses (ID, title, credits), sorted by credits in descending order and then by title.
2. List the students born in 2006, showing their ID, name, and date of birth.
3. List the students whose name starts with `N'Nguyen'` or ends with `N'Linh'`.
4. List the instructors hired between 2012 and 2016 inclusive, with their years of service up to today (use `DATEDIFF`).
5. List the students who have no advisor.
6. Show the 3 highest-paid instructors. Include ties.
7. For each enrollment, show `StudentID`, `SectionID`, `Grade`, and a column `Result` that says `'Excellent'` (≥ 8.5), `'Pass'` (≥ 5), `'Fail'` (< 5), or `'In progress'` (`NULL`).

**Joins**

8. List each instructor with the name of their department.
9. List each student (name) with the name of their advisor. Include students who have no advisor.
10. Show the full timetable for `'SP2026'`: section ID, course title, instructor name, and room. Include sections that have no instructor.
11. List the names of the students who took a course taught by `N'Edgar Codd'`.
12. List every course together with the titles of its prerequisites. Courses without prerequisites should appear with `NULL`.
13. List the departments that have no instructor.
14. List pairs of students (name 1, name 2) who were in the same section, each pair shown once.
15. Show the transcript of student `'CS170005'`: course ID, title, credits, semester, and grade, ordered by semester.

## Part B – Aggregation, subqueries, and set operations

**Aggregation**

16. The number of students in each department (department name). Include departments that have 0 students.
17. The average, minimum, and maximum grade for each section, counting graded enrollments only.
18. The departments whose average instructor salary is above 90,000.
19. The number of enrollments in each semester.
20. Each student's GPA, weighted by credits, over graded courses only, rounded to 2 decimals and sorted from highest to lowest.
21. The fill rate of each section (enrollments ÷ capacity, as a percentage), from highest to lowest.

**Subqueries**

22. The instructors who earn more than the average salary of all instructors.
23. The students who have never enrolled in any section. Write this query in two different ways.
24. The courses that have never been offered.
25. The instructors who earn more than the average salary of their **own** department (correlated subquery).
26. The student or students with the highest single grade in `'SP2026'`.
27. The students who took **every** course offered by the `'MATH'` department (use double `NOT EXISTS`).
28. For each department, the instructor with the highest salary (use a CTE or a subquery).

**Set operations**

29. The IDs of students who enrolled in both `'PRF192'` and `'MAD101'` (use `INTERSECT`).
30. The IDs of instructors who teach a section but do not advise any student (use `EXCEPT`).

**Challenge**

31. Rank the students within each department by GPA (use `RANK() OVER`).
32. List every course that is directly **or indirectly** a prerequisite of `'SWP391'` (use a recursive CTE).

Sample solutions: [`solutions/lab05-solution.sql`](solutions/lab05-solution.sql).

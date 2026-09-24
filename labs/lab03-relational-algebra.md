# Lab 3 – Relational Algebra

**Chapter:** 4 · **Duration:** 3 hours · **CLOs:** CLO4

## Objectives

- Write relational algebra expressions for queries stated in English.
- Check your expressions by translating them to SQL and running them against `UniversityDB`.

**Optional tool:** RelaX, an online relational algebra calculator (https://dbis-uibk.github.io/relax/). You can load a small dataset into it and run your expressions.

## Schema (simplified)

```
Department(DeptID, DeptName, Building, Budget, HeadID)
Instructor(InstructorID, FullName, Email, Salary, HireDate, DeptID)
Student(StudentID, FullName, Gender, DateOfBirth, Email, DeptID, AdvisorID, EnrollYear)
Course(CourseID, Title, Credits, DeptID)
Prerequisite(CourseID, PrereqID)
Section(SectionID, CourseID, Semester, InstructorID, Room, Capacity)
Enrollment(StudentID, SectionID, EnrollDate, Grade)
```

## Exercises

For each query, (a) write the relational algebra expression, (b) write the equivalent SQL, and (c) run the SQL and record how many rows it returns.

**Basic (σ, π, ρ)**

1. IDs and names of female students.
2. Titles of courses that have 4 credits.
3. Names and salaries of instructors hired before 2012.
4. The distinct semesters in which sections were offered.

**Joins**

5. For each student, their name and the name of the department of their major.
6. Names of instructors who taught at least one section in SP2026.
7. Names of students who enrolled in a section of IDB201.
8. Every department (name) together with the name of its head. Include departments that have no head (use an outer join).
9. Pairs of courses (title, prerequisite title).

**Set operations**

10. IDs of students who enrolled in PRF192 **or** MAD101.
11. IDs of students who enrolled in both PRF192 **and** MAD101.
12. IDs of courses that have **never** been offered in any section.
13. IDs of instructors who do **not** advise any student.

**Division and aggregation**

14. IDs of students who enrolled in **every** section offered in FA2025.
15. For each department, the number of instructors and the maximum salary.
16. IDs of students who took **all** the prerequisites of SWP391.

**Challenge**

17. Names of instructors who earn the highest salary in their department.
18. IDs of students who never received a grade below 5.

Sample solutions: [`solutions/lab03-solution.md`](solutions/lab03-solution.md).

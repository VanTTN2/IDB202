# Lab 7 – Functional Dependencies and Normalization

**Chapter:** 8 · **Duration:** 1 lab session · **CLOs:** CLO6

## Objectives

- Compute attribute closures, candidate keys, and minimal covers.
- Identify the normal form of a relation and decompose it into 3NF or BCNF.
- Check whether a decomposition is lossless and dependency-preserving.

This lab is done on paper. Show every step of your working.

---

## Part A – Closures and keys

1. R(A, B, C, D, E), F = {A → B, BC → D, D → E, E → A}.
   a. Compute {A}⁺, {B, C}⁺, and {C, E}⁺.
   b. Find every candidate key of R.
   c. List the prime attributes.

2. R(A, B, C, D, E, G), F = {AB → C, C → A, BC → D, ACD → B, D → EG, BE → C, CG → BD, CE → AG}.
   a. Is BD a superkey?
   b. Find a candidate key.

3. Use Armstrong's axioms to prove that if X → Y and X → Z, then X → YZ (the union rule).

## Part B – Minimal cover

4. Find a minimal cover of F = {A → BC, B → C, A → B, AB → C, AC → D}.
5. Find a minimal cover of F = {AB → C, C → A, BC → D, ACD → B, D → E, D → G, BE → C, CG → B, CG → D, CE → A, CE → G}.

## Part C – Normal forms and decomposition

6. For each relation, find the keys, give the highest normal form it satisfies (1NF, 2NF, 3NF, or BCNF), and justify your answer.
   a. R(A, B, C, D), F = {AB → C, C → D}
   b. R(A, B, C, D), F = {A → B, B → C, C → D}
   c. R(A, B, C), F = {AB → C, C → B}
   d. R(A, B, C, D), F = {AB → CD, D → A}

7. Consider the table below, which an office used to record project assignments.

   `ProjectAssign(EmpID, EmpName, DeptID, DeptName, ProjID, ProjName, Budget, Hours)`

   Business rules:
   - each employee has one name and belongs to one department;
   - each department has one name;
   - each project has one name and one budget;
   - an employee works a certain number of hours on each project.

   a. Write the functional dependencies.
   b. Find the candidate key.
   c. Give one example each of an update anomaly, an insertion anomaly, and a deletion anomaly.
   d. Decompose the relation into 3NF using the synthesis algorithm.
   e. Is your result also in BCNF?
   f. Write the `CREATE TABLE` statements for the result.

8. R(Student, Course, Instructor), F = {Student Course → Instructor, Instructor → Course}.
   a. Show that R is in 3NF but not in BCNF.
   b. Decompose R into BCNF.
   c. Which FD is lost? Show two rows that are legal in the decomposed tables but would violate the lost FD once they are joined.

## Part D – Properties of decompositions

9. R(A, B, C, D), F = {A → B, C → D}. Is the decomposition {R1(A, B), R2(C, D)} lossless? What about {R1(A, B), R2(A, C, D)}? And {R1(A, B), R2(A, C), R3(C, D)}?
10. R(A, B, C, D, E), F = {A → C, B → C, C → D, DE → C, CE → A}. Is the decomposition {AD, AB, BE, CDE, AE} lossless? Use the chase (tableau) test.

## Part E – UniversityDB

11. Write the functional dependencies that hold on the `Section` table of `UniversityDB`. Remember that it has both a surrogate key and the `UNIQUE (CourseID, Semester, Room)` constraint. What are its candidate keys? Which normal form is it in?

Sample solutions: [`solutions/lab07-solution.md`](solutions/lab07-solution.md).

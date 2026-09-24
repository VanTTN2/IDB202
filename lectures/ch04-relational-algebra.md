# Chapter 4 – Relational Algebra

**Learning outcomes:** CLO4

After studying this chapter, you should be able to:

- use the unary operators: selection, projection, and rename;
- use the set operators: union, intersection, difference, and Cartesian product;
- use joins (theta, equi, natural, outer) and division;
- write multi-step algebra expressions for English queries and translate them to SQL.

**Readings:** [DSC] Ch. 2 (2.5–2.6); [DMS] Ch. 4 (4.1–4.2)

---

## 4.1 What is relational algebra?

Relational algebra is a **procedural** query language. Each operator takes one or two relations as input and produces a **new relation**, so operators can be nested (the language is *closed*). It is the theoretical foundation of SQL, and query optimizers use it internally.

The relations used in the examples are simplified versions of the `UniversityDB` tables.

## 4.2 Unary operators

### Selection σ

`σ<condition>(R)` returns the **tuples** (rows) of R that satisfy the condition. The condition may use `=, ≠, <, ≤, >, ≥` combined with `∧` (AND), `∨` (OR), and `¬` (NOT).

```
σ DeptID = 'CS' ∧ Salary > 90000 (Instructor)
```

Selection is commutative: `σc1(σc2(R)) = σc2(σc1(R)) = σc1 ∧ c2(R)`.

### Projection π

`π<attribute list>(R)` keeps only the listed **columns** and **removes duplicate tuples**.

```
π FullName, Salary (Instructor)
```

Projection is not commutative in general. `π L1(π L2(R)) = π L1(R)` only when L1 ⊆ L2.

### Rename ρ

`ρ S(B1, …, Bn)(R)` renames the relation to S and its attributes to B1…Bn. It is needed to join a relation with itself. The assignment arrow `←` stores intermediate results:

```
CSInstr ← σ DeptID = 'CS' (Instructor)
Result  ← π FullName (CSInstr)
```

## 4.3 Set operators

**Union compatibility:** R and S must have the same degree, and corresponding attributes must have compatible domains.

| Operator | Result |
|---|---|
| `R ∪ S` | Tuples in R, in S, or in both, with duplicates removed |
| `R ∩ S` | Tuples in both R and S |
| `R − S` | Tuples in R that are not in S |
| `R × S` | Every combination of a tuple of R with a tuple of S (degree = deg R + deg S, cardinality = \|R\| · \|S\|) |

**Example.** IDs of students who enrolled in section 5 *or* section 6:

```
π StudentID (σ SectionID = 5 (Enrollment)) ∪ π StudentID (σ SectionID = 6 (Enrollment))
```

**Example.** Departments that have **no** instructor:

```
π DeptID (Department) − π DeptID (Instructor)
```

## 4.4 Joins

### Theta join and equi-join

`R ⋈<condition> S = σ<condition>(R × S)`

An **equi-join** is a theta join whose condition uses only `=`.

```
Instructor ⋈ Instructor.DeptID = Department.DeptID Department
```

### Natural join `R * S` (also written `R ⋈ S`)

An equi-join on **all attributes that have the same name** in R and S. Only one copy of each shared attribute is kept.

> **Warning:** in `UniversityDB`, `Student * Instructor` would join on both `FullName` and `Email`, because those names appear in both tables. The result is almost certainly not what you want. Rename attributes or use an explicit theta join.

### Outer joins

| Operator | Keeps |
|---|---|
| Left outer join `R ⟕ S` | All tuples of R. Unmatched R tuples are padded with `NULL` |
| Right outer join `R ⟖ S` | All tuples of S |
| Full outer join `R ⟗ S` | All tuples of both relations |

**Example.** Every department with its instructors, including departments that have no instructors:

```
Department ⟕ Department.DeptID = Instructor.DeptID Instructor
```

### Semi-join (optional)

`R ⋉ S` returns the tuples of R that have at least one match in S. It is equivalent to `π attrs(R) (R ⋈ S)`.

## 4.5 Division ÷

`R(Z) ÷ S(X)`, where X ⊆ Z, returns the tuples t over Y = Z − X such that **for every** tuple s in S, the combination (t, s) is in R. Use division for **"for all"** queries.

**Example.** Students who enrolled in **all** sections of IDB202 taught in SP2026:

```
IDBSec  ← π SectionID (σ CourseID = 'IDB202' ∧ Semester = 'SP2026' (Section))
StuSec  ← π StudentID, SectionID (Enrollment)
Result  ← StuSec ÷ IDBSec
```

Division can be expressed with the basic operators:

```
T1 ← π Y (R) × S          -- every possible pair
T2 ← π Y (T1 − R)         -- the Ys that are missing some pair
Result ← π Y (R) − T2
```

## 4.6 Aggregation and grouping (extended algebra)

`<grouping attributes> ℱ <function list> (R)`, sometimes written with the Greek letter γ.

```
DeptID ℱ COUNT(InstructorID), AVG(Salary) (Instructor)
```

The functions are `SUM`, `AVG`, `MIN`, `MAX`, and `COUNT`.

## 4.7 A complete set of operators

`{σ, π, ∪, −, ×, ρ}` is **complete**: every other operator can be expressed with them.

- `R ∩ S = R − (R − S)`
- `R ⋈c S = σc(R × S)`
- Division, as shown above.

## 4.8 Translating to SQL

| Algebra | SQL |
|---|---|
| `π A,B (R)` | `SELECT DISTINCT A, B FROM R` |
| `σ c (R)` | `SELECT * FROM R WHERE c` |
| `R × S` | `SELECT * FROM R CROSS JOIN S` |
| `R ⋈c S` | `SELECT * FROM R JOIN S ON c` |
| `R ∪ S`, `R ∩ S`, `R − S` | `UNION`, `INTERSECT`, `EXCEPT` |
| `R ⟕c S` | `SELECT * FROM R LEFT JOIN S ON c` |

> SQL tables are **bags** (multisets), not sets. `SELECT` keeps duplicates unless you write `DISTINCT`.

## 4.9 Worked examples

**Q1.** Names of instructors who teach a section in SP2026.

```
π FullName (Instructor ⋈ Instructor.InstructorID = Section.InstructorID (σ Semester = 'SP2026' (Section)))
```

**Q2.** Titles of courses that have never been offered.

```
Offered ← π CourseID (Section)
π Title ((π CourseID (Course) − Offered) * Course)
```

**Q3.** IDs of students enrolled in both PRF192 and MAD101.

```
PRF ← π StudentID (Enrollment * σ CourseID = 'PRF192' (Section))
MAD ← π StudentID (Enrollment * σ CourseID = 'MAD101' (Section))
PRF ∩ MAD
```

**Q4.** Pairs of instructors in the same department, each pair listed once.

```
I1 ← ρ I1(ID1, N1, E1, S1, H1, D1) (Instructor)
I2 ← ρ I2(ID2, N2, E2, S2, H2, D2) (Instructor)
π N1, N2 (I1 ⋈ D1 = D2 ∧ ID1 < ID2 I2)
```


## 4.10 Relational calculus

Relational algebra is **procedural**: an expression says which operations to apply and in what order. **Relational calculus** is **declarative**: it describes *which* tuples the result contains, using first-order logic.

### Tuple relational calculus (TRC)

A query has the form `{ t | P(t) }`: the set of tuples t for which the formula P is true.

```
-- Instructors earning more than 90,000
{ t | t ∈ Instructor ∧ t.Salary > 90000 }

-- Names of students enrolled in section 5
{ t.FullName | t ∈ Student ∧ ∃e ( e ∈ Enrollment ∧ e.StudentID = t.StudentID ∧ e.SectionID = 5 ) }

-- Students enrolled in every FA2025 section (division, written with ∀)
{ s.StudentID | s ∈ Student ∧
    ∀x ( x ∈ Section ∧ x.Semester = 'FA2025' →
          ∃e ( e ∈ Enrollment ∧ e.StudentID = s.StudentID ∧ e.SectionID = x.SectionID ) ) }
```

Useful equivalences: `∀x P(x) ≡ ¬∃x ¬P(x)` and `P → Q ≡ ¬P ∨ Q`. The SQL "double `NOT EXISTS`" pattern for division (Chapter 6) is exactly this rewriting.

### Domain relational calculus (DRC)

Variables range over **attribute values** instead of tuples:

```
{ ⟨n⟩ | ∃i ∃e ∃s ∃h ∃d ( Instructor(i, n, e, s, h, d) ∧ d = 'CS' ) }
```

DRC is the basis of Query-By-Example (QBE) interfaces and of Datalog.

### Safety

The query `{ t | ¬(t ∈ Student) }` asks for "every tuple that is not a student", which is an *infinite* set. A calculus expression is **safe** if its result is guaranteed to use only values from the database (its *active domain*) and the constants in the query. Only safe expressions are allowed.

### Codd's theorem

> Relational algebra and **safe** relational calculus (TRC and DRC) have **exactly the same expressive power**.

A query language that can express every query of relational algebra is called **relationally complete**. SQL is relationally complete. With aggregation, bags, and recursion (`WITH RECURSIVE`), it is actually more expressive.

## 4.11 Limits of expressive power

Relational algebra **cannot** express the **transitive closure** of a relation. For example, it cannot express "all direct *and indirect* prerequisites of SWP391" when the chain can have any length.

*Intuition.* Each algebra expression has a fixed size, so it can follow at most a fixed number k of joins along a chain. A prerequisite chain of length k + 1 then gives a wrong answer. The formal proof uses locality arguments from finite model theory, which is beyond this course.

This is why SQL:1999 added **recursive common table expressions**, and why the logic language **Datalog** (algebra plus recursion) is studied in database theory and used in program analysis and knowledge graphs.

## Research Corner

**Paper.** Codd, E. F. "Relational Completeness of Data Base Sublanguages." In R. Rustin (ed.), *Data Base Systems*, Prentice-Hall, 1972, pp. 65–98.

**Guiding questions**

1. How does Codd define relational completeness?
2. Codd shows how to translate any calculus query into algebra. Outline, in your own words, the steps for a query with one ∃.
3. Why is safety needed for the equivalence to hold?

**Extension (for the strongest students).** Look up Datalog. Write the Datalog program for all prerequisites of a course, and compare it with the recursive CTE in Lab 5, question 32.

---

## Summary

- σ selects rows, π selects columns, and ρ renames.
- Joins are built from × and σ. Outer joins keep unmatched tuples.
- Use `−` for "not" and "never" queries, and `÷` for "all" queries.

## Review questions

1. Why does projection remove duplicates in relational algebra, while SQL `SELECT` does not?
2. Explain when a natural join gives an unexpected result.
3. Show that `R ∩ S` can be written using only `−`.
4. Write an algebra expression for: instructors who earn more than every instructor in the SE department.
5. Given R with 5 tuples and S with 4 tuples, what are the minimum and maximum cardinalities of R ⋈ S, R ⟕ S, and R × S?

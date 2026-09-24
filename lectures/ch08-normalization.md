# Chapter 8 – Functional Dependencies and Normalization

**Learning outcomes:** CLO6

After studying this chapter, you should be able to:

- identify update, insertion, and deletion anomalies;
- use Armstrong's axioms to reason about functional dependencies;
- compute attribute closures, find candidate keys, and compute a minimal cover;
- test whether a relation is in 1NF, 2NF, 3NF, or BCNF, and decompose it;
- check that a decomposition is lossless-join and dependency-preserving.

**Readings:** [DSC] Ch. 7; [DMS] Ch. 19

---

## 8.1 Why normalize? Anomalies

Suppose we store everything in one table:

`EnrollInfo(StudentID, StudentName, DeptID, DeptName, CourseID, CourseTitle, Grade)`

| StudentID | StudentName | DeptID | DeptName | CourseID | CourseTitle | Grade |
|---|---|---|---|---|---|---|
| SE170001 | An | SE | Software Eng. | PRF192 | Programming Fund. | 8.5 |
| SE170001 | An | SE | Software Eng. | MAD101 | Discrete Math | 7.0 |
| CS170004 | Duc | CS | Computer Sci. | PRF192 | Programming Fund. | 7.75 |

| Anomaly | Example |
|---|---|
| **Redundancy** | `DeptName` and `CourseTitle` are repeated many times. |
| **Update anomaly** | Renaming the SE department means changing many rows. Missing one makes the data inconsistent. |
| **Insertion anomaly** | A new course cannot be recorded until some student enrolls in it, because `StudentID` is part of the key. |
| **Deletion anomaly** | Deleting Duc's only enrollment also deletes the fact that the CS department exists. |

**Normalization** removes these anomalies by decomposing relations according to their **functional dependencies**.

## 8.2 Functional dependencies (FDs)

`X → Y` (X *functionally determines* Y) means: any two tuples that agree on X must also agree on Y.

In the example:

```
StudentID → StudentName, DeptID
DeptID    → DeptName
CourseID  → CourseTitle
StudentID, CourseID → Grade
```

- An FD is **trivial** if Y ⊆ X.
- FDs come from the **meaning** of the data (business rules), not from a particular table instance. An instance can only *disprove* an FD.

### Armstrong's axioms

| Rule | Statement |
|---|---|
| Reflexivity | If Y ⊆ X then X → Y |
| Augmentation | If X → Y then XZ → YZ |
| Transitivity | If X → Y and Y → Z then X → Z |
| *Union* (derived) | If X → Y and X → Z then X → YZ |
| *Decomposition* (derived) | If X → YZ then X → Y and X → Z |
| *Pseudotransitivity* (derived) | If X → Y and WY → Z then WX → Z |

The axioms are **sound** (they derive only true FDs) and **complete** (they derive every FD that follows).

## 8.3 Attribute closure

X⁺ is the set of all attributes that X determines.

**Algorithm:**

```
X+ := X
repeat
    for each FD  A → B  in F:
        if A ⊆ X+ then X+ := X+ ∪ B
until X+ does not change
```

**Example.** R(A, B, C, D, E), F = {A → B, B → C, CD → E}.

- `{A}⁺ = {A, B, C}`
- `{A, D}⁺ = {A, D, B, C, E}` = every attribute, so **AD is a superkey**.

### Finding candidate keys

1. Attributes that appear on **no right-hand side** must be in every key. Here they are A and D.
2. Attributes that appear **only on right-hand sides** are in no key. Here that is E.
3. Start from the required attributes and add others until the closure contains all attributes. Keep only the minimal sets.

For the example, the only candidate key is **AD**.

**Prime attribute:** an attribute that belongs to *some* candidate key.

## 8.4 Minimal cover (canonical cover)

A set of FDs Fc equivalent to F in which:

1. every right-hand side is a single attribute;
2. no left-hand side has an extraneous attribute;
3. no FD is redundant.

**Example.** F = {A → BC, B → C, A → B, AB → C}

1. Split the right-hand sides: A → B, A → C, B → C, A → B, AB → C.
2. AB → C: B is extraneous because A⁺ already contains C. It becomes A → C.
3. Remove the duplicates and the redundant FDs. A → C follows from A → B and B → C.

**Fc = {A → B, B → C}**

## 8.5 Normal forms

### First normal form (1NF)

Every attribute value is **atomic**: no repeating groups and no multivalued attributes.

*Violation:* `Student(StudentID, Name, Phones)` with `Phones = "090..., 091..."`.
*Fix:* move the phones to a separate table `StudentPhone(StudentID, Phone)`.

### Second normal form (2NF)

The relation is in 1NF and **no non-prime attribute depends on only part of a candidate key** (no partial dependencies).

In `EnrollInfo`, the key is (StudentID, CourseID). `StudentID → StudentName` and `CourseID → CourseTitle` are partial dependencies, so the relation is not in 2NF.

*Decompose:*

```
Student(StudentID, StudentName, DeptID, DeptName)
Course(CourseID, CourseTitle)
Enrollment(StudentID, CourseID, Grade)
```

A relation whose candidate keys each have a single attribute is automatically in 2NF.

### Third normal form (3NF)

For every non-trivial FD X → A, **either X is a superkey or A is a prime attribute**. Equivalently: 2NF and no **transitive** dependency of a non-prime attribute on a key.

`Student(StudentID, StudentName, DeptID, DeptName)` has StudentID → DeptID → DeptName, which is transitive. It is not in 3NF.

*Decompose:*

```
Student(StudentID, StudentName, DeptID)
Department(DeptID, DeptName)
```

### Boyce–Codd normal form (BCNF)

For every non-trivial FD X → A, **X is a superkey**. BCNF is stricter than 3NF.

*Example that is in 3NF but not in BCNF:* `Teach(Student, Course, Instructor)`, with FDs

- {Student, Course} → Instructor
- Instructor → Course (each instructor teaches only one course)

The candidate keys are {Student, Course} and {Student, Instructor}, so every attribute is prime and the relation is in 3NF. However, Instructor → Course has a left side that is not a superkey, so it is **not in BCNF**.

*Decompose on Instructor → Course:* `R1(Instructor, Course)` and `R2(Student, Instructor)`. This decomposition is lossless, but it **loses** the FD {Student, Course} → Instructor.

### Summary of normal forms

| NF | Condition |
|---|---|
| 1NF | Atomic values |
| 2NF | 1NF + no partial dependency of a non-prime attribute on a key |
| 3NF | For each X → A: X is a superkey **or** A is prime |
| BCNF | For each X → A: X is a superkey |

Each normal form includes the previous ones: BCNF ⊂ 3NF ⊂ 2NF ⊂ 1NF. Higher forms exist (4NF for multivalued dependencies, 5NF for join dependencies) and are covered in the textbooks.

## 8.6 Properties of decompositions

### Lossless (non-additive) join

Decomposing R into R1 and R2 is **lossless** if and only if

```
(R1 ∩ R2) → R1   or   (R1 ∩ R2) → R2
```

In words, the common attributes form a key of at least one of the two parts. A lossy decomposition produces **spurious tuples** when the parts are joined back together.

### Dependency preservation

The union of the FDs projected onto R1, …, Rn must imply every FD in F. When this holds, each FD can be checked inside a single table.

| Algorithm | Lossless | Dependency-preserving |
|---|---|---|
| 3NF synthesis | always | always |
| BCNF decomposition | always | **not always** |

## 8.7 Algorithms

### 3NF synthesis

1. Compute a minimal cover Fc.
2. For each group of FDs with the same left-hand side X, create the relation (X ∪ all of their right-hand sides).
3. If no relation contains a candidate key of R, add a relation containing one candidate key.
4. Remove any relation that is contained in another.

### BCNF decomposition

```
result := {R}
while some Ri in result is not in BCNF:
    find a non-trivial FD X → Y on Ri where X is not a superkey of Ri
    replace Ri with (X ∪ Y) and (Ri − (Y − X))
```

## 8.8 Worked example

**R(StudentID, CourseID, Semester, InstructorID, InstructorName, Room)**

FDs:

1. StudentID, CourseID, Semester → InstructorID
2. InstructorID → InstructorName
3. CourseID, Semester → Room

**Candidate key:** {StudentID, CourseID, Semester}. None of these attributes appears on a right-hand side, and together their closure is all of R.

**Normal form:** FD 3 is a partial dependency, so R is not in 2NF.

**3NF synthesis:**

```
R1(StudentID, CourseID, Semester, InstructorID)   -- from FD 1; contains the key
R2(InstructorID, InstructorName)                  -- from FD 2
R3(CourseID, Semester, Room)                      -- from FD 3
```

Every left-hand side is a key of its relation, so the result is also in BCNF.

## 8.9 Denormalization

Sometimes a designer deliberately stores redundant data, for example a `TotalCredits` column or a reporting table, to make reads faster. The redundancy must then be kept consistent with triggers or batch jobs.

---

## Summary

- Anomalies come from storing independent facts in the same relation.
- FDs capture business rules. Closures give keys, and minimal covers give 3NF designs.
- In practice, aim for **3NF or BCNF**. Every decomposition must be lossless, and it should preserve dependencies.

## Review questions

1. Give one example each of an insertion, a deletion, and an update anomaly for `Order(OrderID, CustomerID, CustomerName, ProductID, ProductName, Qty)`.
2. R(A, B, C, D), F = {AB → C, C → D, D → A}. Find all candidate keys. Is R in 3NF? In BCNF?
3. Compute a minimal cover of F = {A → BC, B → C, AB → D}.
4. Is the decomposition of R(A, B, C) into R1(A, B) and R2(B, C) lossless when F = {A → B}? When F = {B → C}?
5. Why is a 3NF design sometimes preferred to a BCNF design?

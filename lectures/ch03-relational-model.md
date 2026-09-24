# Chapter 3 – The Relational Model and ER-to-Relational Mapping

**Learning outcomes:** CLO1, CLO2

After studying this chapter, you should be able to:

- define relation, tuple, attribute, domain, and degree;
- tell the difference between superkeys, candidate keys, primary keys, and foreign keys;
- explain the entity integrity and referential integrity constraints;
- map an ER diagram to a relational schema with the 7-step algorithm.

**Readings:** [DSC] Ch. 2 (2.1–2.4), Ch. 6 (6.7); [DMS] Ch. 3

---

## 3.1 Relational model concepts

The relational model was proposed by **E. F. Codd in 1970**. It represents the database as a collection of **relations**, which you can picture as tables.

| Formal term | Informal term |
|---|---|
| Relation | Table |
| Tuple | Row |
| Attribute | Column |
| Domain | Set of allowed values (a data type) |
| Degree (arity) | Number of attributes |
| Cardinality | Number of tuples |
| Relation schema `R(A1, …, An)` | Table header |
| Relation state `r(R)` | Table contents |

### Properties of relations

1. The tuples of a relation have **no order**.
2. The attributes of a relation are identified by name, so their order does not matter.
3. Every value is **atomic**. There are no multivalued or composite attribute values. This is called **First Normal Form**.
4. A relation contains **no duplicate tuples**, because it is a set.
5. `NULL` stands for a value that is unknown, not applicable, or missing.

## 3.2 Keys

- **Superkey:** a set of attributes whose values are unique for every tuple. For example, `{StudentID, FullName}` is a superkey of `Student`.
- **Candidate key:** a *minimal* superkey, which means no attribute can be removed from it without it stopping being a superkey. For example, `{StudentID}` and `{Email}`.
- **Primary key (PK):** the candidate key the designer chooses to identify tuples. It is underlined in a schema.
- **Alternate key:** any candidate key that was not chosen as the primary key. In SQL it is declared with `UNIQUE`.
- **Foreign key (FK):** a set of attributes in relation R1 that references the primary key of relation R2. It may be `NULL`, depending on the rules.

## 3.3 Integrity constraints

| Constraint | Rule |
|---|---|
| **Domain constraint** | Each value must come from the attribute's domain. |
| **Key constraint** | No two tuples may have the same value for a candidate key. |
| **Entity integrity** | No primary key attribute may be `NULL`. |
| **Referential integrity** | Every foreign key value must either match an existing primary key value in the referenced relation or be `NULL`. |
| **Semantic (business) constraints** | Other rules, e.g. "an instructor's salary must not exceed the salary of the department head". These are enforced with `CHECK` constraints, triggers, or application code. |

### Operations that can violate constraints

| Operation | Constraints it can violate | Possible reactions |
|---|---|---|
| INSERT | domain, key, entity integrity, referential integrity | reject the insert |
| DELETE | referential integrity (other tuples reference the deleted one) | reject it (`NO ACTION`), `CASCADE`, `SET NULL`, or `SET DEFAULT` |
| UPDATE | all of the above | the same as for insert and delete |

## 3.4 ER-to-relational mapping algorithm

| Step | ER construct | Relational result |
|---|---|---|
| 1 | **Regular (strong) entity type** E | Create relation R with all *simple* attributes of E. Include the simple components of composite attributes. Choose one key as the PK. |
| 2 | **Weak entity type** W with owner E | Create relation R with the attributes of W, plus the PK of the owner as an FK. PK = owner's PK + partial key of W. Usually `ON DELETE CASCADE`. |
| 3 | **Binary 1:1** relationship between S and T | *Foreign key approach:* put the PK of T as an FK in S, preferably choosing S as the side with **total participation**. Other options: merge S and T into one relation, or create a separate relationship relation. |
| 4 | **Binary 1:N** relationship | Put the PK of the **1-side** as an FK in the relation for the **N-side**. Relationship attributes also move to the N-side. |
| 5 | **Binary M:N** relationship | Create a **new relation** containing the PKs of both participants as FKs. Their combination is the PK. Add the relationship's attributes. |
| 6 | **Multivalued attribute** A of E | Create a new relation R(PK of E, A). PK = both attributes. |
| 7 | **n-ary relationship** (n > 2) | Create a new relation containing the PKs of all participants as FKs, plus the relationship's attributes. |

Derived attributes are usually **not stored**. They are computed in queries or views.

### Worked example: mapping UniversityDB

Applying the algorithm to the ER model in Chapter 2 (PKs underlined, FKs marked with *):

```
Department (DeptID, DeptName, Building, Budget, HeadID*)          -- step 1; HEADS 1:1 (step 3)
Instructor (InstructorID, FullName, Email, Salary, HireDate, DeptID*)  -- WORKS_FOR 1:N (step 4)
Student    (StudentID, FullName, Gender, DateOfBirth, Email, EnrollYear,
            DeptID*, AdvisorID*)                                    -- MAJORS_IN, ADVISES (step 4)
Course     (CourseID, Title, Credits, DeptID*)                      -- OFFERS (step 4)
Prerequisite (CourseID*, PrereqID*)                                 -- REQUIRES M:N (step 5)
Section    (SectionID, CourseID*, Semester, InstructorID*, Room, Capacity)
Enrollment (StudentID*, SectionID*, EnrollDate, Grade)              -- ENROLLS M:N (step 5)
```

Notes on the design choices:

- **HEADS (1:1):** the FK `HeadID` goes in `Department`. The other choice, a `HeadOf` column in `Instructor`, would be `NULL` for almost every instructor.
- **SECTION:** in the ER model, `SECTION` could be a weak entity identified by (`CourseID`, `Semester`, `SectionNo`). This implementation uses a **surrogate key** (`SectionID INT IDENTITY`) and keeps the natural key as a `UNIQUE` constraint instead. This is a common practical choice.

## 3.5 Relational schema diagram

```
Department(DeptID, ..., HeadID) ──► Instructor(InstructorID)
Instructor(DeptID)              ──► Department(DeptID)
Student(DeptID)                 ──► Department(DeptID)
Student(AdvisorID)              ──► Instructor(InstructorID)
Course(DeptID)                  ──► Department(DeptID)
Prerequisite(CourseID, PrereqID)──► Course(CourseID)
Section(CourseID)               ──► Course(CourseID)
Section(InstructorID)           ──► Instructor(InstructorID)
Enrollment(StudentID)           ──► Student(StudentID)
Enrollment(SectionID)           ──► Section(SectionID)
```


## 3.6 The relational model as mathematics

These definitions connect the chapter to MAD102 (Discrete Mathematics).

- A **domain** D is a set of atomic values.
- A **relation schema** R(A₁, …, Aₙ) assigns a domain dom(Aᵢ) to each attribute.
- A **relation** r(R) is a *finite subset* of the Cartesian product dom(A₁) × … × dom(Aₙ). Since r is a set, it has no duplicates and no order. These properties come straight from set theory, not from convention.
- A **key constraint** is a first-order logic sentence. For example, "StudentID is a key of Student" is
  ∀t₁ ∀t₂ ( Student(t₁) ∧ Student(t₂) ∧ t₁[StudentID] = t₂[StudentID] → t₁ = t₂ ).
- A **foreign key** is an *inclusion dependency*: π_DeptID(Student) ⊆ π_DeptID(Department).

**Exercise (proof).** Prove that every relation has at least one candidate key. (Hint: the set of all attributes is a superkey. Why? Then argue that a minimal superkey exists because the set of attributes is finite.)

**Exercise (counting).** A relation schema has n attributes. What is the largest possible number of candidate keys? (Hint: candidate keys form an *antichain* under ⊆. Sperner's theorem gives C(n, ⌊n/2⌋).)

## Research Corner

**Paper.** Codd, E. F. "A Relational Model of Data for Large Shared Data Banks." *Communications of the ACM* 13(6), 1970, pp. 377–387.

**Guiding questions**

1. Section 1.2 of the paper describes three kinds of *data dependence* in the systems of that time: ordering, indexing, and access path dependence. Explain each one with an example.
2. Codd uses the term "relation" in its mathematical sense. How is his definition different from a "table" in a spreadsheet?
3. Codd discusses redundancy and consistency in Section 2. Which later concept from this course grew out of that discussion?

**Why this paper matters.** It won Codd the 1981 Turing Award and started a multi-billion-dollar industry. It is also short and readable. Read at least Section 1.

---

## Summary

- A relation is a set of tuples with atomic values. Keys identify tuples, and foreign keys link relations.
- Entity integrity and referential integrity are the two fundamental integrity rules.
- The 7-step algorithm turns an ER model into relations. The most important steps are 1:N (FK on the N-side) and M:N (a new relation).

## Review questions

1. Explain the difference between a superkey and a candidate key. Is every candidate key a superkey?
2. Why can a primary key not contain `NULL`, when a foreign key can?
3. A student is deleted, but their enrollments still reference them. Which constraint is violated, and what are the four possible reactions?
4. Map this ER fragment: `EMPLOYEE (EmpID, Name, {Skill})` —1:N— `PROJECT (ProjID, Title)`, where the relationship has the attribute `Role`.
5. When would you map a 1:1 relationship by merging the two entities into one relation?

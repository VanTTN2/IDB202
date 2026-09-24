# Chapter 9 – Storage, Indexing, and Query Processing

**Learning outcomes:** CLO6

After studying this chapter, you should be able to:

- describe how a DBMS stores tables on disk in pages, and why disk I/O is the main cost;
- explain how B+-tree and hash indexes work, and tell clustered from non-clustered indexes;
- decide which columns to index for a given workload;
- describe the steps of query processing and the role of the query optimizer;
- read a simple execution plan in SQL Server.

**Readings:** [DSC] Ch. 13 (13.1–13.3), Ch. 14 (14.1–14.5), Ch. 15 (15.1–15.2), Ch. 16 (16.1–16.2); [DMS] Ch. 8, Ch. 10 (10.1–10.3), Ch. 12 (12.1–12.4)

> **Connection to your other courses:** ICS102 (Introduction to Computer Systems) explains the memory hierarchy, and CSD203 (next semester) covers trees and hash tables in depth. This chapter gives you the database view of those ideas.

---

## 9.1 Why storage matters

| Storage | Typical access time | Relative speed |
|---|---|---|
| CPU cache | ~1 ns | fastest |
| Main memory (RAM) | ~100 ns | |
| SSD | ~100 µs | ~1,000× slower than RAM |
| Hard disk (HDD) | ~10 ms | ~100,000× slower than RAM |

Databases are usually much larger than main memory, so data lives on disk and is brought into RAM when it is needed. The cost of a query is dominated by **how many pages must be read from disk (I/O)**, not by CPU work.

## 9.2 Pages, records, and files

- The DBMS reads and writes data in fixed-size blocks called **pages**. In SQL Server a page is **8 KB**, and 8 contiguous pages form an *extent*.
- Each page holds several **records** (rows). A row of `Student` takes about 200 bytes, so one page holds roughly 40 students.
- A table is stored as a **file** of pages.

### File organizations

| Organization | Description | Good for | Poor for |
|---|---|---|---|
| **Heap** | Rows in no particular order | Fast inserts, full scans | Finding a single row (must scan everything) |
| **Sorted** | Rows ordered by a key | Range searches on that key | Inserts (rows must be shifted) |
| **Indexed** | A heap or sorted file plus one or more index structures | Fast lookups | Adds cost to writes |

### The buffer pool

The **buffer manager** keeps recently used pages in RAM (the *buffer pool*). When a page is needed:

1. If it is already in the buffer pool, it is a **hit**, and no disk I/O is needed.
2. Otherwise, it is a **miss**. The page is read from disk, possibly replacing another page. A common replacement policy is *LRU*: least recently used.

A modified page (a *dirty page*) is written back to disk later. The log from Chapter 10 makes this delay safe.

## 9.3 Indexes

An **index** is a data structure that finds rows by the value of one or more columns (the **search key**) without scanning the whole table. It works like the index at the back of a textbook.

Each index entry holds a key value and a pointer to the matching row (a *row locator*).

### B+-tree index

The standard index structure in relational DBMSs.

```
                      [  40  |  70  ]                 ← root
                     /       |       \
          [10|20|30]     [40|50|60]    [70|80|90]     ← leaf level (sorted)
             ↔              ↔              ↔           ← leaves linked in order
```

- It is **balanced**: every leaf is at the same depth.
- Each node is one page and holds **hundreds** of keys (a high *fan-out*). The tree is therefore very shallow. With a fan-out of 200, three levels index 200³ = 8 million rows.
- **Equality search** (`WHERE StudentID = 'SE170001'`) follows one path from root to leaf, so it reads about 3–4 pages instead of thousands.
- **Range search** (`WHERE Grade BETWEEN 8 AND 10`) finds the first key and then follows the linked leaves.
- Inserts and deletes keep the tree balanced by splitting and merging nodes.

### Hash index

A **hash function** maps each key to a *bucket*: `h(key) mod N`.

- It is very fast for **equality** searches (about one I/O).
- It is **useless for range searches**, because hashing does not preserve order.
- In-memory hash tables are also used inside query execution (the *hash join*, below).

### Clustered versus non-clustered indexes

| | Clustered index | Non-clustered index |
|---|---|---|
| What is stored | The rows themselves, in key order | Key + pointer to the row |
| How many per table | **One** (rows can be ordered only one way) | Many (up to 999 in SQL Server) |
| Default in SQL Server | Created for the `PRIMARY KEY` | Created for `UNIQUE` constraints |
| Best for | Range queries on the key | Selective lookups on other columns |

### Creating indexes in SQL Server

```sql
-- Foreign key used in joins
CREATE INDEX IX_Enrollment_SectionID ON Enrollment (SectionID);

-- Composite index: column order matters (left-most prefix rule)
CREATE INDEX IX_Section_Course_Semester ON Section (CourseID, Semester);
--   helps: WHERE CourseID = 'IDB201'
--   helps: WHERE CourseID = 'IDB201' AND Semester = 'SP2026'
--   does NOT help: WHERE Semester = 'SP2026'   (not a prefix)

-- Covering index: INCLUDE extra columns so the table itself is not read
CREATE INDEX IX_Enrollment_Section_Grade ON Enrollment (SectionID) INCLUDE (Grade);

CREATE UNIQUE INDEX UX_Instructor_Email ON Instructor (Email);
DROP INDEX IX_Enrollment_SectionID ON Enrollment;
```

### Choosing indexes

| Good candidates | Poor candidates |
|---|---|
| FK columns used in joins | Very small tables |
| Columns often used in `WHERE`, `ORDER BY`, `GROUP BY` | Columns with few distinct values (`Gender`) |
| Highly **selective** columns (many distinct values) | Tables with many writes and few reads |
| Columns that queries use together (composite index) | Columns wrapped in functions: `WHERE YEAR(HireDate) = 2015` cannot use an index on `HireDate`. Rewrite it as `HireDate >= '2015-01-01' AND HireDate < '2016-01-01'` |

**Trade-off:** each index makes reads faster but makes `INSERT`, `UPDATE`, and `DELETE` slower, because the index must be updated too, and it takes extra storage.

## 9.4 Query processing

```
 SQL query
    │  1. Parsing and translation   → syntax check, name resolution, relational algebra tree
    ▼
 Relational algebra expression
    │  2. Optimization              → choose the cheapest equivalent plan, using statistics
    ▼
 Execution plan
    │  3. Evaluation                → the execution engine runs the plan
    ▼
 Query result
```

### Evaluating single operators

| Operator | Algorithms |
|---|---|
| Selection σ | **Table scan** (read every page); **index seek** (use a B+-tree or hash index) |
| Sorting | External merge sort (for data larger than memory) |
| Join ⋈ | **Nested loops** (for each outer row, find matching inner rows — good when one input is small or the inner side has an index); **Merge join** (both inputs sorted on the join key); **Hash join** (build a hash table on the smaller input, then probe it with the larger one — good for large unsorted inputs) |

### Query optimization

A SQL query can be executed in many equivalent ways. The **optimizer** chooses a plan in two parts.

**1. Equivalence rules** (rewriting the algebra tree). Examples:

- **Push selections down:** `σ c (R ⋈ S) = σ c (R) ⋈ S` when c uses only attributes of R. Filtering early makes intermediate results smaller.
- **Push projections down:** keep only the columns that are needed.
- **Join order:** `(R ⋈ S) ⋈ T = R ⋈ (S ⋈ T)`. Joining the smallest results first is usually cheaper.

**Example.** "Names of students enrolled in section 12":

```
Plan A:  π FullName ( σ SectionID = 12 ( Student ⋈ Enrollment ) )
Plan B:  π FullName ( Student ⋈ σ SectionID = 12 ( Enrollment ) )
```

Plan B joins the students with just a handful of enrollment rows, instead of all of them, so it is much cheaper.

**2. Cost estimation.** The optimizer uses **statistics** (the number of rows, the number of distinct values, and histograms of value distribution) to estimate how many rows each step produces and how many I/Os each plan costs. It then chooses the cheapest plan.

```sql
-- SQL Server keeps statistics automatically; you can view or refresh them
DBCC SHOW_STATISTICS ('Enrollment', 'PK_Enrollment');
UPDATE STATISTICS Enrollment;
```

## 9.5 Reading execution plans in SQL Server

In SSMS, press **Ctrl+M** (*Include Actual Execution Plan*) and run a query. Read the plan from **right to left**.

| Operator you will see | Meaning |
|---|---|
| Table Scan / Clustered Index Scan | Reads the whole table |
| Index Seek / Clustered Index Seek | Uses an index to go straight to the matching rows |
| Key Lookup | Fetches the missing columns from the table after a non-clustered index seek (a covering index removes it) |
| Nested Loops / Merge Join / Hash Match | The join algorithm chosen |
| Sort | An explicit sort (expensive on large inputs) |

```sql
SET STATISTICS IO ON;    -- shows "logical reads" (pages read) for each table
SELECT * FROM Enrollment WHERE SectionID = 12;
```

Compare the number of logical reads before and after creating `IX_Enrollment_SectionID`. On the small sample database the difference is tiny, but on a table with millions of rows it is the difference between milliseconds and minutes. Lab 8 uses a larger generated table so that you can see the difference.


## 9.6 Cost formulas

Notation: b_R is the number of pages of R, n_R is the number of tuples of R, M is the number of buffer pages available, and F is the fan-out of a B+-tree.

| Operation | Cost in page I/Os (approximate) |
|---|---|
| Full scan of R | b_R |
| B+-tree equality search on a key | h + 1, where h = ⌈log_F n_R⌉ (the height) |
| B+-tree range search returning m matching pages | h + m (clustered); h + number of matching *tuples* (non-clustered, worst case) |
| External merge sort of R | 2·b_R·(1 + ⌈log_{M−1}⌈b_R / M⌉⌉) |
| Block nested-loops join R ⋈ S (R outer) | b_R + ⌈b_R / (M − 2)⌉·b_S |
| Index nested-loops join | b_R + n_R·(cost of one index lookup in S) |
| Sort-merge join | cost to sort R and S + b_R + b_S |
| Hash join (enough memory) | 3·(b_R + b_S) |

**Worked example.** Enrollment has 1,000,000 rows in 10,000 pages, and Student has 50,000 rows in 1,000 pages. With M = 102 buffer pages:

- Block nested loops with Student as the outer relation: 1,000 + ⌈1,000/100⌉·10,000 = 101,000 I/Os.
- Hash join: 3·(1,000 + 10,000) = 33,000 I/Os.
- At about 0.1 ms per I/O on an SSD, that is roughly 10 s against 3 s.

**Why a clustered index matters.** A range query that matches 10,000 tuples on 100 pages costs about 100 I/Os with a clustered index. With a non-clustered index it can cost up to 10,000 I/Os, one per tuple. At that point a full scan can be cheaper, and the optimizer will choose it.

## 9.7 Join ordering

For n relations there are many possible join orders: the number of *left-deep* trees alone is n!, and bushy trees make it even larger. The System R optimizer (Selinger et al., 1979) introduced **dynamic programming** over subsets of relations:

```
for each single relation Ri:       best[{Ri}] = cheapest access path for Ri
for size = 2 … n:
    for each subset S of size |S| = size:
        best[S] = min over Ri in S of  cost(best[S − {Ri}] ⋈ Ri)
return best[{R1, …, Rn}]
```

This runs in O(n·2ⁿ) time instead of O(n!), and it is still the core of most commercial optimizers.

**Where optimizers go wrong.** Cost estimates depend on *cardinality estimates*, which rely on assumptions such as uniform value distributions and independence between columns. Errors multiply through joins. Leis et al. (2015) showed that estimation errors, not the cost model, cause most bad plans.

## Research Corner

**Papers.**

1. Bayer, R. and McCreight, E. "Organization and Maintenance of Large Ordered Indexes." *Acta Informatica* 1, 1972.
2. Selinger, P. G. et al. "Access Path Selection in a Relational Database Management System." *SIGMOD*, 1979.
3. Leis, V. et al. "How Good Are Query Optimizers, Really?" *PVLDB* 9(3), 2015.
4. Kraska, T. et al. "The Case for Learned Index Structures." *SIGMOD*, 2018.

**Guiding questions**

1. (Bayer and McCreight) Why is a B-tree node the size of a disk page instead of holding a single key, as in a binary search tree? Compare the height of a binary search tree and a B+-tree for 10⁹ keys.
2. (Selinger) What is an "interesting order", and why does the optimizer keep plans that are not the cheapest?
3. (Leis) Which part of the optimizer causes the most bad plans, according to the experiments?
4. (Kraska) The paper views an index as a *model* that predicts the position of a key. How does this connect to the machine-learning courses in your program (AIL303m)? What are the weaknesses of learned indexes for workloads with frequent inserts?

---

## Summary

- Data is stored in pages on disk, and a query's cost is mostly the number of pages it reads.
- B+-trees support both equality and range searches. Hash indexes support equality searches only.
- A table has one clustered index (the row order) and can have many non-clustered indexes.
- The optimizer rewrites queries using equivalence rules and chooses a plan using cost estimates based on statistics.

## Review questions

1. Why is the number of disk I/Os a better measure of query cost than the number of CPU instructions?
2. A B+-tree has a fan-out of 100. How many levels does it need to index 1,000,000 rows?
3. Why can a hash index not answer `WHERE Salary > 90000`?
4. A table has a composite index on (`LastName`, `FirstName`). Which of these conditions can use it: `LastName = 'Tran'`; `FirstName = 'Binh'`; `LastName = 'Tran' AND FirstName = 'Binh'`?
5. Explain why pushing a selection below a join usually reduces the cost of a query.
6. When is a nested-loops join a good choice? When is a hash join better?

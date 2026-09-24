# Chapter 10 – Transactions and Concurrency Control

**Learning outcomes:** CLO8

After studying this chapter, you should be able to:

- define a transaction and explain the ACID properties;
- use `BEGIN TRAN`, `COMMIT`, `ROLLBACK`, and `SAVE TRAN` together with `TRY…CATCH`;
- describe the concurrency anomalies: lost update, dirty read, non-repeatable read, and phantom;
- explain schedules, conflict serializability, and two-phase locking at an introductory level;
- choose a suitable isolation level and recognize deadlocks.

**Readings:** [DSC] Ch. 17, Ch. 18 (18.1–18.2); [DMS] Ch. 16, Ch. 17

---

## 10.1 What is a transaction?

A **transaction** is a sequence of database operations that forms **one logical unit of work**: either all of them take effect, or none of them do.

**Example:** moving a student from section 5 to section 6 is two operations, a DELETE and an INSERT. If the system crashes between them, the student ends up in neither section.

```sql
BEGIN TRANSACTION;
    DELETE FROM Enrollment WHERE StudentID = 'SE170003' AND SectionID = 5;
    INSERT INTO Enrollment (StudentID, SectionID) VALUES ('SE170003', 6);
COMMIT TRANSACTION;
```

## 10.2 ACID properties

| Property | Meaning | Guaranteed by |
|---|---|---|
| **Atomicity** | All or nothing | Recovery manager (undo using the log) |
| **Consistency** | A transaction takes the database from one consistent state to another | Constraints + correct application logic |
| **Isolation** | Concurrent transactions do not interfere with each other; the result is as if they ran one after another | Concurrency control (locks, versions) |
| **Durability** | Once committed, changes survive crashes | Recovery manager (redo using the write-ahead log) |

## 10.3 Transactions in T-SQL

```sql
SET XACT_ABORT ON;   -- any run-time error rolls back the whole transaction

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE Department SET Budget = Budget - 100000 WHERE DeptID = 'CS';
    UPDATE Department SET Budget = Budget + 100000 WHERE DeptID = 'IA';

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;           -- re-raise the error to the caller
END CATCH;
```

- **Autocommit** (the SQL Server default): every statement is its own transaction.
- **Explicit** transactions start with `BEGIN TRAN`.
- **Savepoints** (`SAVE TRANSACTION sp1;` … `ROLLBACK TRANSACTION sp1;`) undo part of a transaction.
- `@@TRANCOUNT` returns the nesting level of the current transaction.

## 10.4 Transaction states

```
            ┌──────────► Partially committed ──► Committed
 Active ────┤
            └──────────► Failed ──► Aborted (rolled back)
```

## 10.5 Concurrency anomalies

Without concurrency control, interleaving the operations of transactions T1 and T2 can cause the following problems.

| Anomaly | Scenario |
|---|---|
| **Lost update** | T1 and T2 both read a budget of 100. T1 writes 100 + 10. T2 writes 100 − 20. T1's update is lost. |
| **Dirty read** | T2 reads a value that T1 has written but not committed. T1 then rolls back, so T2 used data that never existed. |
| **Non-repeatable read** | T1 reads a row, T2 updates and commits it, and T1 reads the row again and gets a different value. |
| **Phantom read** | T1 counts the enrollments in section 12, T2 inserts a new enrollment and commits, and T1 counts again and gets a different number. |

## 10.6 Schedules and serializability

- A **schedule** is an ordering of the operations of several transactions, e.g. `r1(A) w1(A) r2(A) w2(A) c1 c2`.
- In a **serial** schedule, the transactions run one after another. A serial schedule is always correct, but it allows no concurrency.
- A schedule is **serializable** if its effect is equivalent to some serial schedule.
- Two operations **conflict** if they belong to different transactions, access the same item, and at least one of them is a write. The conflicting pairs are r–w, w–r, and w–w.
- A schedule is **conflict serializable** if its **precedence graph** has no cycle. The graph has an edge Ti → Tj whenever an operation of Ti conflicts with, and comes before, an operation of Tj.

**Example:** `S: r1(A) r2(A) w1(A) w2(A)`

- r2(A) comes before w1(A), so there is an edge T2 → T1.
- r1(A) comes before w2(A), and w1(A) comes before w2(A), so there is an edge T1 → T2.
- The graph has a cycle, so S is **not** conflict serializable. S is the lost-update schedule.

## 10.7 Lock-based concurrency control

| Lock | Allows | Compatible with S | Compatible with X |
|---|---|---|---|
| Shared (S) | Read | Yes | No |
| Exclusive (X) | Write | No | No |

### Two-phase locking (2PL)

1. **Growing phase:** the transaction acquires locks and releases none.
2. **Shrinking phase:** the transaction releases locks and acquires none.

2PL guarantees conflict serializability. **Strict 2PL** holds every X lock until commit or abort, which also prevents cascading rollbacks. Most DBMSs use strict 2PL.

### Deadlock

T1 locks A and waits for B, while T2 locks B and waits for A. The DBMS detects the cycle in its **wait-for graph** and aborts one of the transactions, called the *victim*. SQL Server reports error **1205** to the victim.

Ways to reduce deadlocks: access tables in the same order in every transaction, keep transactions short, and do not wait for user input inside a transaction.

## 10.8 Isolation levels (SQL standard and SQL Server)

| Isolation level | Dirty read | Non-repeatable read | Phantom |
|---|---|---|---|
| READ UNCOMMITTED | possible | possible | possible |
| **READ COMMITTED** (SQL Server default) | prevented | possible | possible |
| REPEATABLE READ | prevented | prevented | possible |
| SERIALIZABLE | prevented | prevented | prevented |
| SNAPSHOT (SQL Server, uses row versioning) | prevented | prevented | prevented* |

\* SNAPSHOT isolation prevents all three anomalies in the table, but it can allow other anomalies such as *write skew*.

```sql
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
BEGIN TRAN;
    ...
COMMIT;
```

A higher isolation level gives more **correctness** but less **concurrency** (more blocking).

## 10.9 Fixing the enrollment race condition

The procedure `usp_EnrollStudent` from Chapter 9 checks the capacity and then inserts. Two sessions can both pass the check. There are three ways to fix this:

```sql
BEGIN TRAN;
    -- UPDLOCK + HOLDLOCK lock the section row and the key range until commit
    SELECT @capacity = Capacity
    FROM   Section WITH (UPDLOCK, HOLDLOCK)
    WHERE  SectionID = @SectionID;

    SELECT @enrolled = COUNT(*) FROM Enrollment WHERE SectionID = @SectionID;
    IF @enrolled < @capacity
        INSERT INTO Enrollment (StudentID, SectionID) VALUES (@StudentID, @SectionID);
COMMIT;
```

The other two options are running the transaction at `SERIALIZABLE`, or relying on the capacity trigger, which runs inside the same transaction as the insert.

## 10.10 Recovery (overview)

- The **transaction log** records every change (before and after images) *before* the data pages are written. This is **write-ahead logging** (WAL).
- After a crash, the system **redoes** committed transactions and **undoes** uncommitted ones. The ARIES algorithm does this.
- A **checkpoint** limits how much of the log must be processed during recovery.
- **Backups** (full, differential, and log backups) protect against losing the disk itself.


## 10.11 More theory: recoverability and view serializability

### Recoverable schedules

Serializability is not enough. A schedule must also be safe with respect to **aborts**.

| Property | Definition | Why it matters |
|---|---|---|
| **Recoverable** | If Tj reads a value written by Ti, then Ti commits before Tj commits | Otherwise a committed Tj depends on an aborted Ti |
| **Cascadeless (ACA)** | Transactions read only values written by *committed* transactions | Avoids cascading aborts |
| **Strict** | No transaction reads *or overwrites* an uncommitted value | Undo can simply restore before-images |

Strict ⊂ cascadeless ⊂ recoverable. Strict 2PL produces strict schedules.

**Example.** `w1(A) r2(A) c2 a1` is **not recoverable**: T2 committed after reading a value that T1 later aborted.

### View serializability

Two schedules are **view equivalent** if every read reads from the same write in both schedules and the final write of each item is the same. View serializability accepts *more* schedules than conflict serializability. The extra schedules contain **blind writes** (writes without a prior read).

`r1(A) w2(A) w1(A) w3(A)` is view serializable (equivalent to T1 T2 T3), but it is not conflict serializable.

**Complexity.** Testing conflict serializability takes polynomial time (cycle detection). Testing **view serializability is NP-complete** (Papadimitriou, 1979). This is why real systems use conflict serializability.

### Proof sketch: 2PL guarantees conflict serializability

Suppose the precedence graph of a 2PL schedule has a cycle T₁ → T₂ → … → Tₖ → T₁. An edge Ti → Tj means that Ti released a lock that Tj later acquired. Let ℓ(T) be the *lock point* of T, the moment it acquires its last lock. Along each edge, Ti releases a lock before Tj acquires a conflicting one, so ℓ(Ti) < ℓ(Tj). Following the cycle gives ℓ(T₁) < ℓ(T₁), a contradiction. So the graph is acyclic, and the transactions are equivalent to the serial order of their lock points. ∎

### Snapshot isolation and write skew

Under **snapshot isolation (SI)**, each transaction reads a consistent snapshot and commits only if no concurrent transaction wrote the same rows ("first committer wins"). SI prevents the anomalies in §10.8, but it allows **write skew**.

> **Rule:** every department must keep at least one head, who may be one of two co-heads. T1 checks "the other co-head is present" and removes co-head A. At the same time, T2 checks "the other co-head is present" and removes co-head B. The two transactions write *different* rows, so both commit, and the department has no head.

Serializable snapshot isolation (Cahill et al., 2008) detects this pattern. PostgreSQL implements it as its `SERIALIZABLE` level.

## Research Corner

**Papers.**

1. Eswaran, K. P., Gray, J. N., Lorie, R. A., and Traiger, I. L. "The Notions of Consistency and Predicate Locks in a Database System." *CACM* 19(11), 1976.
2. Berenson, H. et al. "A Critique of ANSI SQL Isolation Levels." *SIGMOD*, 1995.
3. Gray, J. "The Transaction Concept: Virtues and Limitations." *VLDB*, 1981.

**Guiding questions**

1. (Eswaran et al.) Why are locks on individual rows not enough to prevent phantoms? What is a *predicate lock*?
2. (Berenson et al.) The authors show that the ANSI definitions of the isolation levels in terms of three "phenomena" are ambiguous. Give one anomaly that is not in the ANSI table.
3. (Gray) Which of the "limitations" Gray lists in 1981 are still problems in today's distributed systems?

---

## Summary

- A transaction is a unit of work with the ACID properties.
- Without isolation, interleaved transactions cause lost updates, dirty reads, non-repeatable reads, and phantoms.
- Conflict serializability is tested with a precedence graph. Strict 2PL ensures it in practice.
- Isolation levels trade correctness for concurrency.

## Review questions

1. Explain each ACID property with an example from `UniversityDB`.
2. Draw the precedence graph for `r1(X) r2(Y) w1(Y) w2(X) c1 c2`. Is the schedule conflict serializable?
3. Which anomaly does READ COMMITTED allow that REPEATABLE READ prevents?
4. What is a deadlock, and how does SQL Server resolve it?
5. Why should a transaction never wait for user input?

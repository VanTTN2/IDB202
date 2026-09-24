# Chapter 1 – Introduction to Database Systems

**Learning outcomes:** CLO1

After studying this chapter, you should be able to:

- define data, database, DBMS, and database system;
- explain the drawbacks of file-based data management and how a DBMS addresses them;
- describe the three-schema architecture and the two kinds of data independence;
- identify the main database users and the components of a DBMS;
- compare the main data models.

**Readings:** [DSC] Ch. 1; [DMS] Ch. 1

---

## 1.1 Basic definitions

| Term | Definition |
|---|---|
| **Data** | Known facts that can be recorded and that have implicit meaning, e.g. a student's name and date of birth. |
| **Database** | A logically coherent collection of related data, designed and built for a specific purpose and a specific group of users. |
| **Database Management System (DBMS)** | Software that lets users *define*, *construct*, *manipulate*, and *share* databases. Examples: SQL Server, PostgreSQL, MySQL, Oracle, SQLite. |
| **Database system** | The database together with the DBMS software and the applications that use them. |
| **Metadata** | Data about data: the description of the database's structure (tables, columns, types, constraints), stored in the **system catalog**, also called the *data dictionary*. |

A DBMS supports four groups of operations:

1. **Defining:** specifying the data types, structures, and constraints of the data.
2. **Constructing:** storing the data on a storage medium that the DBMS controls.
3. **Manipulating:** querying, inserting, updating, and deleting data.
4. **Sharing:** allowing many users and programs to access the data at the same time.

## 1.2 The file-based approach and its problems

Before DBMSs existed, each application kept its own data files. For example, the registrar's office and the finance office might each keep their own student file.

| Problem | Example |
|---|---|
| **Data redundancy** | A student's address is stored in both files. |
| **Inconsistency** | The student moves; one file is updated and the other is not. |
| **Hard to access data** | Every new question ("students with GPA > 8 in CS") needs a new program. |
| **Data isolation** | The data is spread over files with different formats. |
| **Integrity problems** | Rules such as "grade is between 0 and 10" are buried in program code. |
| **Atomicity problems** | A crash in the middle of a money transfer leaves the data half-updated. |
| **Concurrent-access anomalies** | Two clerks update the same balance and one update is lost. |
| **Security problems** | It is hard to give a user access to only part of the data. |

## 1.3 Characteristics of the database approach

1. **Self-describing:** the database contains its own metadata in the catalog.
2. **Program–data independence:** the structure of the data is kept separate from the programs, so changing the storage structure does not require changing the programs.
3. **Data abstraction:** users see a *conceptual* view of the data instead of storage details.
4. **Multiple views:** different users can see different subsets of the data.
5. **Sharing and multi-user transaction processing:** concurrency control and recovery keep the data correct while many users access it.

## 1.4 Data models

A **data model** is a collection of concepts for describing the structure of a database, the operations on it, and its constraints.

| Category | Description | Examples |
|---|---|---|
| Conceptual (high-level) | Close to how users think about data | Entity–Relationship (ER) model, UML class diagrams |
| Representational (implementation) | Understood by users, and implemented directly by DBMSs | **Relational model**, network model, hierarchical model |
| Physical (low-level) | Describes how data is stored on disk | File organizations, indexes, access paths |

Other models in wide use today include the **document model** (MongoDB), **key–value** stores (Redis), **wide-column** stores (Cassandra), and the **graph model** (Neo4j). Together these are often called *NoSQL* databases.

### Schema versus instance

- **Schema** (the *intension*): the description of the database, which rarely changes. Example: `Student(StudentID, FullName, DateOfBirth, DeptID)`.
- **Instance** or **state** (the *extension*): the data in the database at a particular moment, which changes often.

## 1.5 The three-schema architecture (ANSI/SPARC)

```
          External level     View 1   View 2   ...   View n
                                 \      |           /
          Conceptual level        Conceptual schema
                                        |
          Internal level           Internal schema
                                        |
                                 Stored database
```

- **Internal level:** the physical storage structures and access paths.
- **Conceptual level:** the structure of the whole database for the whole community of users (entities, data types, relationships, constraints), with physical details hidden.
- **External level:** user views, each describing the part of the database that one user group is interested in.

The DBMS translates requests between the levels. These translations are called **mappings**.

### Data independence

- **Logical data independence:** the conceptual schema can change (for example, a new column is added) without changing external schemas or application programs.
- **Physical data independence:** the internal schema can change (for example, an index is added or files are reorganized) without changing the conceptual schema.

Physical data independence is easier to achieve. Most relational DBMSs provide it fully.

## 1.6 Database languages

| Language | Purpose | SQL examples |
|---|---|---|
| **DDL** (Data Definition Language) | Define schemas | `CREATE`, `ALTER`, `DROP` |
| **DML** (Data Manipulation Language) | Query and modify data | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| **DCL** (Data Control Language) | Permissions | `GRANT`, `REVOKE` |
| **TCL** (Transaction Control Language) | Transactions | `BEGIN TRAN`, `COMMIT`, `ROLLBACK` |

SQL is **declarative**: you state *what* data you want, and the DBMS decides *how* to get it.

## 1.7 Database users

- **Database administrators (DBAs):** grant access, monitor performance, and manage backup and recovery.
- **Database designers:** identify the data to be stored and choose the structures to represent it.
- **End users:** casual users, naive users (for example, bank tellers using forms), and sophisticated users (analysts).
- **Application programmers:** write the programs that access the database.

## 1.8 DBMS components

- **Query processor:** DDL interpreter, DML compiler, query optimizer, and query evaluation engine.
- **Storage manager:** buffer manager, file manager, authorization and integrity manager, and transaction manager.
- **Disk storage:** data files, the data dictionary, indexes, and statistics.

## 1.9 DBMS architectures

- **Centralized:** everything runs on one machine.
- **Two-tier client/server:** the client application talks directly to the database server.
- **Three-tier:** client (browser) → application or web server → database server. This is the typical architecture for web applications.

## 1.10 When not to use a DBMS

A DBMS adds cost for hardware, software, training, and processing overhead. A simple file may be better when the data is small and simple, when it will not change, when it has only one user, or when there are hard real-time requirements that a DBMS cannot meet.

---

## Summary

- A DBMS provides centralized control of data. It reduces redundancy, enforces integrity, supports concurrency, and keeps data secure.
- The three-schema architecture separates the external, conceptual, and internal levels, which makes logical and physical data independence possible.
- The relational model is the dominant representational data model, and SQL is its standard language.

## Review questions

1. List four disadvantages of the file-based approach and explain how a DBMS solves each one.
2. Explain the difference between a database schema and a database state.
3. Describe the three levels of the ANSI/SPARC architecture.
4. What is the difference between logical and physical data independence? Which one is harder to achieve, and why?
5. Classify each statement as DDL, DML, DCL, or TCL: `CREATE TABLE`, `SELECT`, `GRANT`, `ROLLBACK`, `UPDATE`, `ALTER TABLE`.

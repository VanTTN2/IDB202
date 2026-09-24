# Lab 4 – SQL DDL and Integrity Constraints

**Chapter:** 5 · **Duration:** 3 hours · **CLOs:** CLO3, CLO5

## Objectives

- Build a database from a relational schema, with named constraints.
- Test that the constraints work by trying to insert invalid data.
- Change the schema with `ALTER TABLE`.

## Scenario: LibraryDB

Implement this schema in a new database called `LibraryDB`.

```
Publisher(PublisherID, Name, Country)
Book(ISBN, Title, PubYear, Price, PublisherID*)
Author(AuthorID, FullName, Nationality)
BookAuthor(ISBN*, AuthorID*, AuthorOrder)
Member(MemberID, FullName, Email, JoinDate, MemberType)
BookCopy(ISBN*, CopyNo, Status)
Loan(LoanID, MemberID*, ISBN*, CopyNo*, LoanDate, DueDate, ReturnDate)
```

## Tasks

### Part A – Create the tables (60 minutes)

Create every table with appropriate data types and these rules:

1. `ISBN` is exactly 13 characters.
2. `Title`, `FullName`, and `Name` store Unicode text and are required.
3. `PubYear` is between 1450 and the current year. (Hint: `YEAR(GETDATE())` is allowed in a `CHECK` constraint.)
4. `Price` is greater than or equal to 0, with 2 decimal places.
5. `Email` is unique and must contain `@`.
6. `JoinDate` defaults to today.
7. `MemberType` is one of `'Student'`, `'Staff'`, or `'Guest'`, and defaults to `'Student'`.
8. `BookCopy` is a weak entity: its key is (`ISBN`, `CopyNo`). Deleting a book deletes its copies.
9. `Status` is one of `'Available'`, `'OnLoan'`, or `'Lost'`.
10. `LoanID` is generated automatically.
11. `DueDate` is later than `LoanDate`, and `ReturnDate` is either `NULL` or on or after `LoanDate`.
12. (`ISBN`, `CopyNo`) in `Loan` references `BookCopy`.
13. `BookAuthor.AuthorOrder` is a positive integer, and each (`ISBN`, `AuthorOrder`) pair is unique.

Name every constraint using the conventions `PK_`, `FK_`, `UQ_`, `CK_`, and `DF_`.

### Part B – Test the constraints (45 minutes)

Insert at least 3 valid rows into each table. Then write **one INSERT that violates each of the rules 1–13**, run it, and copy the error message into a comment.

### Part C – ALTER TABLE (45 minutes)

1. Add a column `Phone VARCHAR(15) NULL` to `Member`.
2. Add a `CHECK` constraint on `Phone` so that it contains only digits. (Hint: `Phone NOT LIKE '%[^0-9]%'`.)
3. Change `Publisher.Country` to `NVARCHAR(60)`.
4. Remove the `Nationality` column from `Author`.
5. Rename the `Status` constraint by dropping it and creating it again with a new name.
6. Try `DROP TABLE Book;`. Why does it fail? Write a script that drops every table in the correct order.

### Part D – Reflection (30 minutes)

Answer these questions in comments:

1. Which referential action did you choose for `Loan → Member`, and why?
2. Can your schema stop a copy from being loaned twice at the same time? If not, which chapter's technique would enforce that rule?

Sample solution: [`solutions/lab04-solution.sql`](solutions/lab04-solution.sql).

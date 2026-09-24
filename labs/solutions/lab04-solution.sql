/* IDB201 – Lab 4 sample solution: LibraryDB */
USE master;
GO
IF DB_ID(N'LibraryDB') IS NOT NULL
BEGIN
    ALTER DATABASE LibraryDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE LibraryDB;
END
GO
CREATE DATABASE LibraryDB;
GO
USE LibraryDB;
GO

-- ===================== Part A =====================
CREATE TABLE Publisher (
    PublisherID INT          NOT NULL,
    Name        NVARCHAR(100) NOT NULL,
    Country     NVARCHAR(40)  NULL,
    CONSTRAINT PK_Publisher PRIMARY KEY (PublisherID)
);

CREATE TABLE Book (
    ISBN        CHAR(13)      NOT NULL,
    Title       NVARCHAR(200) NOT NULL,
    PubYear     SMALLINT      NULL,
    Price       DECIMAL(10,2) NOT NULL,
    PublisherID INT           NULL,
    CONSTRAINT PK_Book PRIMARY KEY (ISBN),
    CONSTRAINT CK_Book_ISBN CHECK (LEN(ISBN) = 13 AND ISBN NOT LIKE '%[^0-9]%'),        -- rule 1
    CONSTRAINT CK_Book_PubYear CHECK (PubYear BETWEEN 1450 AND YEAR(GETDATE())),       -- rule 3
    CONSTRAINT CK_Book_Price CHECK (Price >= 0),                                        -- rule 4
    CONSTRAINT FK_Book_Publisher FOREIGN KEY (PublisherID)
        REFERENCES Publisher (PublisherID) ON DELETE SET NULL
);

CREATE TABLE Author (
    AuthorID    INT           NOT NULL,
    FullName    NVARCHAR(100) NOT NULL,
    Nationality NVARCHAR(40)  NULL,
    CONSTRAINT PK_Author PRIMARY KEY (AuthorID)
);

CREATE TABLE BookAuthor (
    ISBN        CHAR(13) NOT NULL,
    AuthorID    INT      NOT NULL,
    AuthorOrder TINYINT  NOT NULL,
    CONSTRAINT PK_BookAuthor PRIMARY KEY (ISBN, AuthorID),
    CONSTRAINT UQ_BookAuthor_Order UNIQUE (ISBN, AuthorOrder),                           -- rule 13
    CONSTRAINT CK_BookAuthor_Order CHECK (AuthorOrder > 0),                              -- rule 13
    CONSTRAINT FK_BookAuthor_Book FOREIGN KEY (ISBN) REFERENCES Book (ISBN) ON DELETE CASCADE,
    CONSTRAINT FK_BookAuthor_Author FOREIGN KEY (AuthorID) REFERENCES Author (AuthorID)
);

CREATE TABLE Member (
    MemberID   INT           NOT NULL,
    FullName   NVARCHAR(100) NOT NULL,
    Email      VARCHAR(100)  NOT NULL,
    JoinDate   DATE          NOT NULL CONSTRAINT DF_Member_JoinDate DEFAULT (CAST(GETDATE() AS DATE)),  -- rule 6
    MemberType VARCHAR(10)   NOT NULL CONSTRAINT DF_Member_Type DEFAULT ('Student'),                  -- rule 7
    CONSTRAINT PK_Member PRIMARY KEY (MemberID),
    CONSTRAINT UQ_Member_Email UNIQUE (Email),                                           -- rule 5
    CONSTRAINT CK_Member_Email CHECK (Email LIKE '%_@_%'),                               -- rule 5
    CONSTRAINT CK_Member_Type CHECK (MemberType IN ('Student', 'Staff', 'Guest'))        -- rule 7
);

CREATE TABLE BookCopy (
    ISBN   CHAR(13)    NOT NULL,
    CopyNo SMALLINT    NOT NULL,
    Status VARCHAR(10) NOT NULL CONSTRAINT DF_BookCopy_Status DEFAULT ('Available'),
    CONSTRAINT PK_BookCopy PRIMARY KEY (ISBN, CopyNo),                                   -- rule 8
    CONSTRAINT CK_BookCopy_Status CHECK (Status IN ('Available', 'OnLoan', 'Lost')),     -- rule 9
    CONSTRAINT FK_BookCopy_Book FOREIGN KEY (ISBN) REFERENCES Book (ISBN) ON DELETE CASCADE  -- rule 8
);

CREATE TABLE Loan (
    LoanID     INT IDENTITY(1,1) NOT NULL,                                               -- rule 10
    MemberID   INT      NOT NULL,
    ISBN       CHAR(13) NOT NULL,
    CopyNo     SMALLINT NOT NULL,
    LoanDate   DATE     NOT NULL CONSTRAINT DF_Loan_LoanDate DEFAULT (CAST(GETDATE() AS DATE)),
    DueDate    DATE     NOT NULL,
    ReturnDate DATE     NULL,
    CONSTRAINT PK_Loan PRIMARY KEY (LoanID),
    CONSTRAINT CK_Loan_Due CHECK (DueDate > LoanDate),                                   -- rule 11
    CONSTRAINT CK_Loan_Return CHECK (ReturnDate IS NULL OR ReturnDate >= LoanDate),      -- rule 11
    CONSTRAINT FK_Loan_Member FOREIGN KEY (MemberID) REFERENCES Member (MemberID),       -- NO ACTION: keep history
    CONSTRAINT FK_Loan_BookCopy FOREIGN KEY (ISBN, CopyNo) REFERENCES BookCopy (ISBN, CopyNo)  -- rule 12
);
GO

-- ===================== Part B =====================
INSERT INTO Publisher VALUES (1, N'McGraw-Hill', N'USA'), (2, N'Pearson', N'UK'), (3, N'NXB Tre', N'Vietnam');
INSERT INTO Book VALUES
('9780078022159', N'Database System Concepts', 2020, 120.00, 1),
('9780072465631', N'Database Management Systems', 2003, 95.50, 1),
('9780133970777', N'Fundamentals of Database Systems', 2016, 110.00, 2);
INSERT INTO Author VALUES
(1, N'Abraham Silberschatz', N'USA'), (2, N'Henry F. Korth', N'USA'), (3, N'S. Sudarshan', N'India'),
(4, N'Raghu Ramakrishnan', N'USA'), (5, N'Johannes Gehrke', N'Germany');
INSERT INTO BookAuthor VALUES
('9780078022159', 1, 1), ('9780078022159', 2, 2), ('9780078022159', 3, 3),
('9780072465631', 4, 1), ('9780072465631', 5, 2);
INSERT INTO Member (MemberID, FullName, Email, MemberType) VALUES
(1, N'Nguyen Van An', 'an@stu.uni.edu', 'Student'),
(2, N'Tran Thi Binh', 'binh@uni.edu', 'Staff'),
(3, N'Guest Reader', 'guest@mail.com', 'Guest');
INSERT INTO BookCopy (ISBN, CopyNo, Status) VALUES
('9780078022159', 1, 'OnLoan'), ('9780078022159', 2, 'Available'), ('9780072465631', 1, 'Available');
INSERT INTO Loan (MemberID, ISBN, CopyNo, LoanDate, DueDate) VALUES
(1, '9780078022159', 1, '2026-09-01', '2026-09-15'),
(2, '9780072465631', 1, '2026-08-01', '2026-08-15'),
(3, '9780078022159', 2, '2026-07-01', '2026-07-10');
UPDATE Loan SET ReturnDate = '2026-08-10' WHERE LoanID = 2;
GO

/* One violating INSERT per rule. Each statement fails; the error message is shown in the comment.
   Run them one at a time (select the line and press F5). They are commented out so this script runs cleanly. */
-- R1:  INSERT INTO Book VALUES ('123', N'Short ISBN', 2020, 10, 1);              -- CK_Book_ISBN
-- R2:  INSERT INTO Author (AuthorID, FullName) VALUES (9, NULL);                  -- Cannot insert NULL into FullName
-- R3:  INSERT INTO Book VALUES ('9999999999999', N'Future', 3000, 10, 1);         -- CK_Book_PubYear
-- R4:  INSERT INTO Book VALUES ('9999999999998', N'Negative', 2020, -1, 1);       -- CK_Book_Price
-- R5a: INSERT INTO Member (MemberID, FullName, Email) VALUES (9, N'X', 'an@stu.uni.edu');  -- UQ_Member_Email
-- R5b: INSERT INTO Member (MemberID, FullName, Email) VALUES (9, N'X', 'no-at-sign');      -- CK_Member_Email
-- R6:  (DEFAULT cannot be "violated"; check that JoinDate = today after inserting without it)
-- R7:  INSERT INTO Member (MemberID, FullName, Email, MemberType) VALUES (9, N'X', 'x@y.z', 'VIP');  -- CK_Member_Type
-- R8:  INSERT INTO BookCopy (ISBN, CopyNo) VALUES ('9780078022159', 1);          -- PK_BookCopy duplicate
-- R9:  INSERT INTO BookCopy VALUES ('9780072465631', 2, 'Stolen');               -- CK_BookCopy_Status
-- R10: INSERT INTO Loan (LoanID, MemberID, ISBN, CopyNo, DueDate) VALUES (99, 1, '9780072465631', 1, '2030-01-01'); -- explicit IDENTITY value not allowed
-- R11: INSERT INTO Loan (MemberID, ISBN, CopyNo, LoanDate, DueDate) VALUES (1, '9780072465631', 1, '2026-09-10', '2026-09-01'); -- CK_Loan_Due
-- R12: INSERT INTO Loan (MemberID, ISBN, CopyNo, DueDate) VALUES (1, '9780072465631', 7, '2030-01-01');  -- FK_Loan_BookCopy
-- R13: INSERT INTO BookAuthor VALUES ('9780072465631', 1, 1);                    -- UQ_BookAuthor_Order

-- ===================== Part C =====================
ALTER TABLE Member ADD Phone VARCHAR(15) NULL;                                                   -- C1
GO   -- a new column is visible only to later batches
ALTER TABLE Member ADD CONSTRAINT CK_Member_Phone CHECK (Phone NOT LIKE '%[^0-9]%');             -- C2
ALTER TABLE Publisher ALTER COLUMN Country NVARCHAR(60) NULL;                                    -- C3
ALTER TABLE Author DROP COLUMN Nationality;                                                      -- C4
ALTER TABLE BookCopy DROP CONSTRAINT CK_BookCopy_Status;                                         -- C5
ALTER TABLE BookCopy ADD CONSTRAINT CK_BookCopy_StatusValues
    CHECK (Status IN ('Available', 'OnLoan', 'Lost'));
GO
-- C6: DROP TABLE Book fails because BookAuthor and BookCopy reference it through foreign keys
-- (and Loan references BookCopy). Drop the child tables first:
/*
DROP TABLE IF EXISTS Loan;
DROP TABLE IF EXISTS BookCopy;
DROP TABLE IF EXISTS BookAuthor;
DROP TABLE IF EXISTS Book;
DROP TABLE IF EXISTS Author;
DROP TABLE IF EXISTS Member;
DROP TABLE IF EXISTS Publisher;
*/

-- ===================== Part D =====================
-- D1: Loan -> Member uses NO ACTION. Loans are historical records; a member who has loans
--     should not be deleted silently (CASCADE would erase history, SET NULL is impossible
--     because MemberID is NOT NULL). Deactivate the member instead.
-- D2: No. A CHECK constraint only sees one row, so it cannot compare a new loan with other
--     open loans of the same copy. Options: a filtered unique index
--       CREATE UNIQUE INDEX UX_Loan_OpenCopy ON Loan (ISBN, CopyNo) WHERE ReturnDate IS NULL;
--     or a trigger (Appendix A).
CREATE UNIQUE INDEX UX_Loan_OpenCopy ON Loan (ISBN, CopyNo) WHERE ReturnDate IS NULL;
GO
PRINT 'LibraryDB lab 4 solution completed.';

/* =====================================================================
   IDB202 – Introduction to Databases
   Sample database: UniversityDB
   DBMS: Microsoft SQL Server 2019+
   Run this whole script in SSMS or Azure Data Studio.
   Running it again drops and recreates the database.
   ===================================================================== */

USE master;
GO

IF DB_ID(N'UniversityDB') IS NOT NULL
BEGIN
    ALTER DATABASE UniversityDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE UniversityDB;
END
GO

CREATE DATABASE UniversityDB;
GO

USE UniversityDB;
GO

/* ---------------------------------------------------------------------
   Schema
   --------------------------------------------------------------------- */

CREATE TABLE Department (
    DeptID      CHAR(4)        NOT NULL,
    DeptName    NVARCHAR(50)   NOT NULL,
    Building    NVARCHAR(30)   NULL,
    Budget      DECIMAL(12,2)  NOT NULL DEFAULT 0,
    CONSTRAINT PK_Department PRIMARY KEY (DeptID),
    CONSTRAINT UQ_Department_Name UNIQUE (DeptName),
    CONSTRAINT CK_Department_Budget CHECK (Budget >= 0)
);

CREATE TABLE Instructor (
    InstructorID CHAR(5)       NOT NULL,
    FullName     NVARCHAR(60)  NOT NULL,
    Email        VARCHAR(80)   NOT NULL,
    Salary       DECIMAL(10,2) NOT NULL,
    HireDate     DATE          NOT NULL,
    DeptID       CHAR(4)       NOT NULL,
    CONSTRAINT PK_Instructor PRIMARY KEY (InstructorID),
    CONSTRAINT UQ_Instructor_Email UNIQUE (Email),
    CONSTRAINT CK_Instructor_Salary CHECK (Salary > 0),
    CONSTRAINT FK_Instructor_Department FOREIGN KEY (DeptID)
        REFERENCES Department (DeptID)
);

-- Each department may have one head, who must be an instructor.
ALTER TABLE Department ADD HeadID CHAR(5) NULL
    CONSTRAINT FK_Department_Head REFERENCES Instructor (InstructorID);

CREATE TABLE Student (
    StudentID   CHAR(8)       NOT NULL,
    FullName    NVARCHAR(60)  NOT NULL,
    Gender      CHAR(1)       NOT NULL,
    DateOfBirth DATE          NOT NULL,
    Email       VARCHAR(80)   NOT NULL,
    DeptID      CHAR(4)       NOT NULL,   -- major
    AdvisorID   CHAR(5)       NULL,
    EnrollYear  SMALLINT      NOT NULL,
    CONSTRAINT PK_Student PRIMARY KEY (StudentID),
    CONSTRAINT UQ_Student_Email UNIQUE (Email),
    CONSTRAINT CK_Student_Gender CHECK (Gender IN ('M','F','O')),
    CONSTRAINT FK_Student_Department FOREIGN KEY (DeptID)
        REFERENCES Department (DeptID),
    CONSTRAINT FK_Student_Advisor FOREIGN KEY (AdvisorID)
        REFERENCES Instructor (InstructorID)
);

CREATE TABLE Course (
    CourseID    CHAR(6)       NOT NULL,
    Title       NVARCHAR(80)  NOT NULL,
    Credits     TINYINT       NOT NULL,
    DeptID      CHAR(4)       NOT NULL,
    CONSTRAINT PK_Course PRIMARY KEY (CourseID),
    CONSTRAINT CK_Course_Credits CHECK (Credits BETWEEN 1 AND 6),
    CONSTRAINT FK_Course_Department FOREIGN KEY (DeptID)
        REFERENCES Department (DeptID)
);

-- Recursive M:N relationship: a course may require other courses.
CREATE TABLE Prerequisite (
    CourseID    CHAR(6) NOT NULL,
    PrereqID    CHAR(6) NOT NULL,
    CONSTRAINT PK_Prerequisite PRIMARY KEY (CourseID, PrereqID),
    CONSTRAINT FK_Prereq_Course FOREIGN KEY (CourseID) REFERENCES Course (CourseID),
    CONSTRAINT FK_Prereq_Prereq FOREIGN KEY (PrereqID) REFERENCES Course (CourseID),
    CONSTRAINT CK_Prereq_NotSelf CHECK (CourseID <> PrereqID)
);

-- A section is one offering of a course in a given semester.
CREATE TABLE Section (
    SectionID    INT IDENTITY(1,1) NOT NULL,
    CourseID     CHAR(6)       NOT NULL,
    Semester     CHAR(6)       NOT NULL,   -- e.g. 'SP2026', 'SU2026', 'FA2026'
    InstructorID CHAR(5)       NULL,
    Room         VARCHAR(10)   NULL,
    Capacity     SMALLINT      NOT NULL DEFAULT 40,
    CONSTRAINT PK_Section PRIMARY KEY (SectionID),
    CONSTRAINT UQ_Section UNIQUE (CourseID, Semester, Room),
    CONSTRAINT CK_Section_Capacity CHECK (Capacity > 0),
    CONSTRAINT FK_Section_Course FOREIGN KEY (CourseID) REFERENCES Course (CourseID),
    CONSTRAINT FK_Section_Instructor FOREIGN KEY (InstructorID)
        REFERENCES Instructor (InstructorID) ON DELETE SET NULL
);

-- M:N relationship between Student and Section, with attribute Grade.
CREATE TABLE Enrollment (
    StudentID   CHAR(8)      NOT NULL,
    SectionID   INT          NOT NULL,
    EnrollDate  DATE         NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    Grade       DECIMAL(4,2) NULL,        -- NULL = not graded yet
    CONSTRAINT PK_Enrollment PRIMARY KEY (StudentID, SectionID),
    CONSTRAINT CK_Enrollment_Grade CHECK (Grade BETWEEN 0 AND 10),
    CONSTRAINT FK_Enrollment_Student FOREIGN KEY (StudentID)
        REFERENCES Student (StudentID) ON DELETE CASCADE,
    CONSTRAINT FK_Enrollment_Section FOREIGN KEY (SectionID)
        REFERENCES Section (SectionID) ON DELETE CASCADE
);
GO

/* ---------------------------------------------------------------------
   Data
   --------------------------------------------------------------------- */

INSERT INTO Department (DeptID, DeptName, Building, Budget) VALUES
('CS',   N'Computer Science',        N'Alpha', 1200000),
('SE',   N'Software Engineering',    N'Alpha',  950000),
('IA',   N'Information Assurance',   N'Beta',   600000),
('BA',   N'Business Administration', N'Gamma',  800000),
('MATH', N'Mathematics',             N'Beta',   400000),
('LANG', N'Languages',               NULL,      150000);   -- no instructors, no courses

INSERT INTO Instructor (InstructorID, FullName, Email, Salary, HireDate, DeptID) VALUES
('I0001', N'Alan Turing',        'alan.turing@uni.edu',       95000, '2012-08-15', 'CS'),
('I0002', N'Grace Hopper',       'grace.hopper@uni.edu',      98000, '2010-01-10', 'SE'),
('I0003', N'Edgar Codd',         'edgar.codd@uni.edu',       105000, '2008-09-01', 'CS'),
('I0004', N'Barbara Liskov',     'barbara.liskov@uni.edu',    92000, '2015-02-20', 'SE'),
('I0005', N'Whitfield Diffie',   'whitfield.diffie@uni.edu',  88000, '2016-06-01', 'IA'),
('I0006', N'Peter Drucker',      'peter.drucker@uni.edu',     76000, '2018-03-12', 'BA'),
('I0007', N'Emmy Noether',       'emmy.noether@uni.edu',      83000, '2011-11-05', 'MATH'),
('I0008', N'Donald Knuth',       'donald.knuth@uni.edu',     110000, '2005-07-01', 'CS'),
('I0009', N'Ada Lovelace',       'ada.lovelace@uni.edu',      70000, '2021-01-15', 'SE'),
('I0010', N'Claude Shannon',     'claude.shannon@uni.edu',    90000, '2014-09-01', 'IA');

UPDATE Department SET HeadID = 'I0008' WHERE DeptID = 'CS';
UPDATE Department SET HeadID = 'I0002' WHERE DeptID = 'SE';
UPDATE Department SET HeadID = 'I0010' WHERE DeptID = 'IA';
UPDATE Department SET HeadID = 'I0006' WHERE DeptID = 'BA';
UPDATE Department SET HeadID = 'I0007' WHERE DeptID = 'MATH';

INSERT INTO Student (StudentID, FullName, Gender, DateOfBirth, Email, DeptID, AdvisorID, EnrollYear) VALUES
('SE170001', N'Nguyen Van An',     'M', '2005-03-14', 'an.nv@stu.uni.edu',    'SE', 'I0002', 2023),
('SE170002', N'Tran Thi Binh',     'F', '2005-07-22', 'binh.tt@stu.uni.edu',  'SE', 'I0004', 2023),
('SE170003', N'Le Hoang Cuong',    'M', '2004-11-02', 'cuong.lh@stu.uni.edu', 'SE', 'I0002', 2023),
('CS170004', N'Pham Minh Duc',     'M', '2005-01-30', 'duc.pm@stu.uni.edu',   'CS', 'I0001', 2023),
('CS170005', N'Hoang Thu Ha',      'F', '2005-05-18', 'ha.ht@stu.uni.edu',    'CS', 'I0003', 2023),
('CS180006', N'Vo Quoc Huy',       'M', '2006-02-09', 'huy.vq@stu.uni.edu',   'CS', 'I0008', 2024),
('IA180007', N'Dang Ngoc Lan',     'F', '2006-08-25', 'lan.dn@stu.uni.edu',   'IA', 'I0005', 2024),
('IA180008', N'Bui Tuan Kiet',     'M', '2006-04-11', 'kiet.bt@stu.uni.edu',  'IA', NULL,    2024),
('BA180009', N'Do Thanh Mai',      'F', '2006-12-01', 'mai.dt@stu.uni.edu',   'BA', 'I0006', 2024),
('BA180010', N'Ngo Gia Bao',       'M', '2006-06-06', 'bao.ng@stu.uni.edu',   'BA', 'I0006', 2024),
('SE190011', N'Truong My Linh',    'F', '2007-09-19', 'linh.tm@stu.uni.edu',  'SE', 'I0009', 2025),
('CS190012', N'Ly Duc Phuc',       'M', '2007-10-10', 'phuc.ld@stu.uni.edu',  'CS', NULL,    2025),
('MA190013', N'Phan Kim Ngan',     'F', '2007-02-28', 'ngan.pk@stu.uni.edu',  'MATH','I0007', 2025),
('SE190014', N'Huynh Nhat Nam',    'O', '2007-07-07', 'nam.hn@stu.uni.edu',   'SE', 'I0004', 2025);

INSERT INTO Course (CourseID, Title, Credits, DeptID) VALUES
('PRF192', N'Programming Fundamentals',          3, 'SE'),
('MAD101', N'Discrete Mathematics',              3, 'MATH'),
('CSD201', N'Data Structures and Algorithms',    3, 'CS'),
('IDB202', N'Introduction to Databases',         3, 'CS'),
('PRO192', N'Object-Oriented Programming',       3, 'SE'),
('SWE201', N'Introduction to Software Engineering', 3, 'SE'),
('SWP391', N'Software Development Project',      4, 'SE'),
('IAO202', N'Information Security Fundamentals', 3, 'IA'),
('ECO111', N'Microeconomics',                    3, 'BA'),
('MAS291', N'Statistics and Probability',        3, 'MATH'),
('DBA301', N'Database Administration',           3, 'CS');   -- never offered

INSERT INTO Prerequisite (CourseID, PrereqID) VALUES
('CSD201', 'PRF192'),
('CSD201', 'MAD101'),
('PRO192', 'PRF192'),
('SWE201', 'PRO192'),
('SWP391', 'SWE201'),
('SWP391', 'IDB202'),
('IAO202', 'IDB202'),
('DBA301', 'IDB202');

SET IDENTITY_INSERT Section ON;
INSERT INTO Section (SectionID, CourseID, Semester, InstructorID, Room, Capacity) VALUES
( 1, 'PRF192', 'FA2025', 'I0009', 'A101', 40),
( 2, 'MAD101', 'FA2025', 'I0007', 'B201', 40),
( 3, 'PRF192', 'SP2026', 'I0004', 'A102', 35),
( 4, 'CSD201', 'SP2026', 'I0001', 'A201', 30),
( 5, 'IDB202', 'SP2026', 'I0003', 'A202', 30),
( 6, 'IDB202', 'SP2026', 'I0008', 'A203', 30),
( 7, 'PRO192', 'SP2026', 'I0002', 'A101', 35),
( 8, 'ECO111', 'SP2026', 'I0006', 'C101', 50),
( 9, 'MAS291', 'SP2026', 'I0007', 'B201', 40),
(10, 'IAO202', 'FA2026', 'I0005', 'B101', 30),
(11, 'SWE201', 'FA2026', 'I0004', 'A201', 30),
(12, 'IDB202', 'FA2026', 'I0003', 'A202', 30),
(13, 'SWP391', 'FA2026', NULL,    'A301', 25);
SET IDENTITY_INSERT Section OFF;

INSERT INTO Enrollment (StudentID, SectionID, EnrollDate, Grade) VALUES
-- Fall 2025
('SE170001', 1, '2025-09-02', 8.50), ('SE170001', 2, '2025-09-02', 7.00),
('SE170002', 1, '2025-09-02', 9.25), ('SE170002', 2, '2025-09-03', 8.00),
('SE170003', 1, '2025-09-03', 4.50), ('SE170003', 2, '2025-09-03', 6.00),
('CS170004', 1, '2025-09-02', 7.75), ('CS170004', 2, '2025-09-02', 9.00),
('CS170005', 2, '2025-09-04', 8.75),
('IA180007', 1, '2025-09-04', 6.50),
-- Spring 2026
('SE170001', 5, '2026-01-06', 8.00), ('SE170001', 7, '2026-01-06', 7.50),
('SE170002', 5, '2026-01-06', 9.50), ('SE170002', 7, '2026-01-07', 8.25),
('SE170003', 3, '2026-01-07', 5.50), ('SE170003', 5, '2026-01-07', 3.75),
('CS170004', 4, '2026-01-06', 8.00), ('CS170004', 6, '2026-01-06', 7.25),
('CS170005', 4, '2026-01-06', 9.00), ('CS170005', 6, '2026-01-08', 9.75),
('CS180006', 3, '2026-01-08', 6.75), ('CS180006', 9, '2026-01-08', 7.00),
('IA180007', 6, '2026-01-09', 5.00),
('BA180009', 8, '2026-01-06', 8.50), ('BA180009', 9, '2026-01-06', 6.25),
('BA180010', 8, '2026-01-07', 4.00),
-- Fall 2026 (in progress, not graded yet)
('SE170001',11, '2026-09-01', NULL), ('SE170002',11, '2026-09-01', NULL),
('SE170002',10, '2026-09-01', NULL), ('CS170004',10, '2026-09-02', NULL),
('SE170003',12, '2026-09-02', NULL), ('CS180006',12, '2026-09-02', NULL),
('SE190011',12, '2026-09-03', NULL), ('CS190012',12, '2026-09-03', NULL);
GO

PRINT 'UniversityDB created successfully.';

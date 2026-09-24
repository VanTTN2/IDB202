/* IDB202 – Lab 5 sample solutions (UniversityDB) */
USE UniversityDB;
GO

-- ===================== Part A =====================

-- Q1
SELECT CourseID, Title, Credits FROM Course ORDER BY Credits DESC, Title;

-- Q2
SELECT StudentID, FullName, DateOfBirth FROM Student
WHERE DateOfBirth >= '2006-01-01' AND DateOfBirth < '2007-01-01';

-- Q3
SELECT StudentID, FullName FROM Student
WHERE FullName LIKE N'Nguyen%' OR FullName LIKE N'%Linh';

-- Q4
SELECT FullName, HireDate, DATEDIFF(YEAR, HireDate, GETDATE()) AS YearsOfService
FROM Instructor
WHERE HireDate >= '2012-01-01' AND HireDate < '2017-01-01';

-- Q5
SELECT StudentID, FullName FROM Student WHERE AdvisorID IS NULL;

-- Q6
SELECT TOP (3) WITH TIES FullName, Salary FROM Instructor ORDER BY Salary DESC;

-- Q7
SELECT StudentID, SectionID, Grade,
       CASE WHEN Grade IS NULL THEN 'In progress'
            WHEN Grade >= 8.5  THEN 'Excellent'
            WHEN Grade >= 5    THEN 'Pass'
            ELSE 'Fail' END AS Result
FROM Enrollment;

-- Q8
SELECT i.InstructorID, i.FullName, d.DeptName
FROM Instructor i JOIN Department d ON d.DeptID = i.DeptID;

-- Q9
SELECT s.FullName AS Student, a.FullName AS Advisor
FROM Student s LEFT JOIN Instructor a ON a.InstructorID = s.AdvisorID;

-- Q10
SELECT sec.SectionID, c.Title, i.FullName AS Instructor, sec.Room
FROM Section sec
JOIN Course c ON c.CourseID = sec.CourseID
LEFT JOIN Instructor i ON i.InstructorID = sec.InstructorID
WHERE sec.Semester = 'SP2026'
ORDER BY sec.SectionID;

-- Q11
SELECT DISTINCT s.FullName
FROM Student s
JOIN Enrollment e   ON e.StudentID = s.StudentID
JOIN Section sec    ON sec.SectionID = e.SectionID
JOIN Instructor i   ON i.InstructorID = sec.InstructorID
WHERE i.FullName = N'Edgar Codd';

-- Q12
SELECT c.CourseID, c.Title, p.Title AS Prerequisite
FROM Course c
LEFT JOIN Prerequisite pr ON pr.CourseID = c.CourseID
LEFT JOIN Course p        ON p.CourseID = pr.PrereqID
ORDER BY c.CourseID;

-- Q13
SELECT d.DeptID, d.DeptName
FROM Department d LEFT JOIN Instructor i ON i.DeptID = d.DeptID
WHERE i.InstructorID IS NULL;

-- Q14
SELECT DISTINCT s1.FullName AS Student1, s2.FullName AS Student2
FROM Enrollment e1
JOIN Enrollment e2 ON e1.SectionID = e2.SectionID AND e1.StudentID < e2.StudentID
JOIN Student s1 ON s1.StudentID = e1.StudentID
JOIN Student s2 ON s2.StudentID = e2.StudentID;

-- Q15
SELECT c.CourseID, c.Title, c.Credits, sec.Semester, e.Grade
FROM Enrollment e
JOIN Section sec ON sec.SectionID = e.SectionID
JOIN Course c    ON c.CourseID = sec.CourseID
WHERE e.StudentID = 'CS170005'
ORDER BY sec.Semester, c.CourseID;

-- ===================== Part B =====================

-- Q16
SELECT d.DeptName, COUNT(s.StudentID) AS NumStudents
FROM Department d LEFT JOIN Student s ON s.DeptID = d.DeptID
GROUP BY d.DeptID, d.DeptName;

-- Q17
SELECT SectionID, AVG(Grade) AS AvgGrade, MIN(Grade) AS MinGrade, MAX(Grade) AS MaxGrade
FROM Enrollment
WHERE Grade IS NOT NULL
GROUP BY SectionID;

-- Q18
SELECT d.DeptName, AVG(i.Salary) AS AvgSalary
FROM Instructor i JOIN Department d ON d.DeptID = i.DeptID
GROUP BY d.DeptID, d.DeptName
HAVING AVG(i.Salary) > 90000;

-- Q19
SELECT sec.Semester, COUNT(*) AS NumEnrollments
FROM Enrollment e JOIN Section sec ON sec.SectionID = e.SectionID
GROUP BY sec.Semester;

-- Q20
SELECT s.StudentID, s.FullName,
       CAST(ROUND(SUM(e.Grade * c.Credits) / SUM(c.Credits), 2) AS DECIMAL(4,2)) AS GPA
FROM Enrollment e
JOIN Student s   ON s.StudentID = e.StudentID
JOIN Section sec ON sec.SectionID = e.SectionID
JOIN Course c    ON c.CourseID = sec.CourseID
WHERE e.Grade IS NOT NULL
GROUP BY s.StudentID, s.FullName
ORDER BY GPA DESC;

-- Q21
SELECT sec.SectionID, sec.CourseID, sec.Semester, sec.Capacity,
       COUNT(e.StudentID) AS Enrolled,
       CAST(100.0 * COUNT(e.StudentID) / sec.Capacity AS DECIMAL(5,2)) AS FillRatePct
FROM Section sec LEFT JOIN Enrollment e ON e.SectionID = sec.SectionID
GROUP BY sec.SectionID, sec.CourseID, sec.Semester, sec.Capacity
ORDER BY FillRatePct DESC;

-- Q22
SELECT FullName, Salary FROM Instructor
WHERE Salary > (SELECT AVG(Salary) FROM Instructor);

-- Q23 (a) NOT EXISTS
SELECT StudentID, FullName FROM Student s
WHERE NOT EXISTS (SELECT 1 FROM Enrollment e WHERE e.StudentID = s.StudentID);
-- Q23 (b) LEFT JOIN ... IS NULL
SELECT s.StudentID, s.FullName
FROM Student s LEFT JOIN Enrollment e ON e.StudentID = s.StudentID
WHERE e.StudentID IS NULL;

-- Q24
SELECT CourseID, Title FROM Course
WHERE CourseID NOT IN (SELECT CourseID FROM Section);   -- safe: Section.CourseID is NOT NULL

-- Q25
SELECT i.FullName, i.DeptID, i.Salary
FROM Instructor i
WHERE i.Salary > (SELECT AVG(i2.Salary) FROM Instructor i2 WHERE i2.DeptID = i.DeptID);

-- Q26
SELECT s.StudentID, s.FullName, e.Grade
FROM Enrollment e
JOIN Section sec ON sec.SectionID = e.SectionID
JOIN Student s   ON s.StudentID = e.StudentID
WHERE sec.Semester = 'SP2026'
  AND e.Grade = (SELECT MAX(e2.Grade)
                 FROM Enrollment e2 JOIN Section s2 ON s2.SectionID = e2.SectionID
                 WHERE s2.Semester = 'SP2026');

-- Q27
SELECT s.StudentID, s.FullName
FROM Student s
WHERE NOT EXISTS (
    SELECT 1 FROM Course c
    WHERE c.DeptID = 'MATH'
      AND NOT EXISTS (
          SELECT 1 FROM Enrollment e JOIN Section sec ON sec.SectionID = e.SectionID
          WHERE e.StudentID = s.StudentID AND sec.CourseID = c.CourseID));

-- Q28
WITH MaxSal AS (
    SELECT DeptID, MAX(Salary) AS MaxSalary FROM Instructor GROUP BY DeptID
)
SELECT i.DeptID, i.FullName, i.Salary
FROM Instructor i JOIN MaxSal m ON m.DeptID = i.DeptID AND m.MaxSalary = i.Salary;

-- Q29
SELECT e.StudentID FROM Enrollment e JOIN Section s ON s.SectionID = e.SectionID WHERE s.CourseID = 'PRF192'
INTERSECT
SELECT e.StudentID FROM Enrollment e JOIN Section s ON s.SectionID = e.SectionID WHERE s.CourseID = 'MAD101';

-- Q30
SELECT InstructorID FROM Section WHERE InstructorID IS NOT NULL
EXCEPT
SELECT AdvisorID FROM Student WHERE AdvisorID IS NOT NULL;

-- Q31
WITH GPA AS (
    SELECT e.StudentID, SUM(e.Grade * c.Credits) / SUM(c.Credits) AS GPA
    FROM Enrollment e
    JOIN Section sec ON sec.SectionID = e.SectionID
    JOIN Course c    ON c.CourseID = sec.CourseID
    WHERE e.Grade IS NOT NULL
    GROUP BY e.StudentID
)
SELECT s.DeptID, s.FullName, CAST(g.GPA AS DECIMAL(4,2)) AS GPA,
       RANK() OVER (PARTITION BY s.DeptID ORDER BY g.GPA DESC) AS RankInDept
FROM GPA g JOIN Student s ON s.StudentID = g.StudentID;

-- Q32
WITH Prereqs AS (
    SELECT PrereqID, 1 AS Depth FROM Prerequisite WHERE CourseID = 'SWP391'
    UNION ALL
    SELECT p.PrereqID, r.Depth + 1
    FROM Prerequisite p JOIN Prereqs r ON p.CourseID = r.PrereqID
)
SELECT DISTINCT r.PrereqID, c.Title, r.Depth
FROM Prereqs r JOIN Course c ON c.CourseID = r.PrereqID
ORDER BY r.Depth;

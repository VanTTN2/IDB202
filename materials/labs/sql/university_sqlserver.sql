/* =====================================================================
   IDB201 - Introduction to Databases
   Lab database: the university schema of DSC (Silberschatz, Korth and
   Sudarshan, Database System Concepts, 7th ed., Fig. 2.9 and Appendix A),
   written for SQL Server 2022.
   The sample data below was written for this course; it is NOT the data
   set distributed with the textbook.
   Running the script again drops and recreates the database.
   ===================================================================== */

use master;
go
if db_id(N'University') is not null
begin
    alter database University set single_user with rollback immediate;
    drop database University;
end
go
create database University;
go
use University;
go

/* ---------------------------------------------------------------------
   Schema (DSC Appendix A). Differences forced by SQL Server:
   - prereq.prereq_id has no cascading action: SQL Server rejects two
     cascading paths from course to prereq (error 1785).
   --------------------------------------------------------------------- */

create table classroom (
    building     varchar(15),
    room_number  varchar(7),
    capacity     numeric(4,0),
    primary key (building, room_number)
);

create table department (
    dept_name varchar(20),
    building  varchar(15),
    budget    numeric(12,2) check (budget > 0),
    primary key (dept_name)
);

create table course (
    course_id varchar(8),
    title     varchar(50),
    dept_name varchar(20),
    credits   numeric(2,0) check (credits > 0),
    primary key (course_id),
    foreign key (dept_name) references department (dept_name)
        on delete set null
);

create table instructor (
    ID        varchar(5),
    name      varchar(20) not null,
    dept_name varchar(20),
    salary    numeric(8,2) check (salary > 29000),
    primary key (ID),
    foreign key (dept_name) references department (dept_name)
        on delete set null
);

create table section (
    course_id    varchar(8),
    sec_id       varchar(8),
    semester     varchar(6) check (semester in ('Fall', 'Winter', 'Spring', 'Summer')),
    year         numeric(4,0) check (year > 1701 and year < 2100),
    building     varchar(15),
    room_number  varchar(7),
    time_slot_id varchar(4),
    primary key (course_id, sec_id, semester, year),
    foreign key (course_id) references course (course_id)
        on delete cascade,
    foreign key (building, room_number) references classroom (building, room_number)
        on delete set null
);

create table teaches (
    ID        varchar(5),
    course_id varchar(8),
    sec_id    varchar(8),
    semester  varchar(6),
    year      numeric(4,0),
    primary key (ID, course_id, sec_id, semester, year),
    foreign key (course_id, sec_id, semester, year)
        references section (course_id, sec_id, semester, year)
        on delete cascade,
    foreign key (ID) references instructor (ID)
        on delete cascade
);

create table student (
    ID        varchar(5),
    name      varchar(20) not null,
    dept_name varchar(20),
    tot_cred  numeric(3,0) check (tot_cred >= 0),
    primary key (ID),
    foreign key (dept_name) references department (dept_name)
        on delete set null
);

create table takes (
    ID        varchar(5),
    course_id varchar(8),
    sec_id    varchar(8),
    semester  varchar(6),
    year      numeric(4,0),
    grade     varchar(2),
    primary key (ID, course_id, sec_id, semester, year),
    foreign key (course_id, sec_id, semester, year)
        references section (course_id, sec_id, semester, year)
        on delete cascade,
    foreign key (ID) references student (ID)
        on delete cascade
);

create table advisor (
    s_ID varchar(5),
    i_ID varchar(5),
    primary key (s_ID),
    foreign key (i_ID) references instructor (ID)
        on delete set null,
    foreign key (s_ID) references student (ID)
        on delete cascade
);

create table time_slot (
    time_slot_id varchar(4),
    day          varchar(1),
    start_hr     numeric(2) check (start_hr >= 0 and start_hr < 24),
    start_min    numeric(2) check (start_min >= 0 and start_min < 60),
    end_hr       numeric(2) check (end_hr >= 0 and end_hr < 24),
    end_min      numeric(2) check (end_min >= 0 and end_min < 60),
    primary key (time_slot_id, day, start_hr, start_min)
);

create table prereq (
    course_id varchar(8),
    prereq_id varchar(8),
    primary key (course_id, prereq_id),
    foreign key (course_id) references course (course_id)
        on delete cascade,
    foreign key (prereq_id) references course (course_id)
);
go

/* ---------------------------------------------------------------------
   Sample data (written for IDB201).
   Deliberate cases for the labs:
   - department 'Philosophy' has no instructors and no students;
   - instructor 'I9000' has a null salary; 'I8000' teaches no section;
   - student 'S0019' takes no course; 'S0020' has no advisor;
   - some takes rows have a null grade (course in progress);
   - course 'CS-499' has no section; prereq has chains of length 3.
   --------------------------------------------------------------------- */

insert into classroom values
 ('Alpha', '101', 60), ('Alpha', '205', 30), ('Beta', '110', 120),
 ('Beta', '220', 40), ('Gamma', '301', 25), ('Gamma', '302', 80);

insert into department values
 ('Comp. Sci.', 'Alpha', 120000), ('Mathematics', 'Beta', 90000),
 ('Physics', 'Gamma', 85000), ('Biology', 'Gamma', 70000),
 ('Economics', 'Beta', 60000), ('Philosophy', 'Alpha', 30000);

insert into course values
 ('CS-101', 'Introduction to Programming', 'Comp. Sci.', 4),
 ('CS-201', 'Data Structures', 'Comp. Sci.', 4),
 ('CS-301', 'Algorithms', 'Comp. Sci.', 3),
 ('CS-315', 'Database Systems', 'Comp. Sci.', 3),
 ('CS-347', 'Database Internals', 'Comp. Sci.', 3),
 ('CS-499', 'Research Seminar', 'Comp. Sci.', 2),
 ('MA-101', 'Calculus I', 'Mathematics', 4),
 ('MA-201', 'Linear Algebra', 'Mathematics', 3),
 ('MA-210', 'Discrete Mathematics', 'Mathematics', 3),
 ('PH-101', 'Mechanics', 'Physics', 4),
 ('PH-201', 'Electromagnetism', 'Physics', 4),
 ('BI-101', 'Cell Biology', 'Biology', 3),
 ('BI-230', 'Bioinformatics', 'Biology', 3),
 ('EC-101', 'Microeconomics', 'Economics', 3),
 ('EC-220', 'Econometrics', 'Economics', 3);

insert into prereq values
 ('CS-201', 'CS-101'), ('CS-301', 'CS-201'), ('CS-301', 'MA-210'),
 ('CS-315', 'CS-201'), ('CS-347', 'CS-315'), ('MA-201', 'MA-101'),
 ('PH-201', 'PH-101'), ('PH-201', 'MA-101'), ('BI-230', 'BI-101'),
 ('BI-230', 'CS-101'), ('EC-220', 'EC-101'), ('EC-220', 'MA-201');

insert into instructor values
 ('I1001', 'Nguyen',   'Comp. Sci.', 92000),
 ('I1002', 'Tran',     'Comp. Sci.', 78000),
 ('I1003', 'Le',       'Comp. Sci.', 65000),
 ('I2001', 'Pham',     'Mathematics', 88000),
 ('I2002', 'Hoang',    'Mathematics', 61000),
 ('I3001', 'Curie',    'Physics', 95000),
 ('I3002', 'Bohr',     'Physics', 83000),
 ('I4001', 'Mendel',   'Biology', 72000),
 ('I5001', 'Keynes',   'Economics', 80000),
 ('I5002', 'Smith',    'Economics', 58000),
 ('I8000', 'Vu',       'Comp. Sci.', 45000),
 ('I9000', 'Dang',     'Biology', null);

insert into time_slot values
 ('A', 'M', 8, 0, 9, 30), ('A', 'W', 8, 0, 9, 30),
 ('B', 'M', 10, 0, 11, 30), ('B', 'W', 10, 0, 11, 30),
 ('C', 'T', 8, 0, 9, 30), ('C', 'R', 8, 0, 9, 30),
 ('D', 'T', 13, 0, 14, 30), ('D', 'R', 13, 0, 14, 30),
 ('E', 'F', 9, 0, 12, 0);

insert into section values
 ('CS-101', '1', 'Fall',   2025, 'Alpha', '101', 'A'),
 ('CS-101', '2', 'Fall',   2025, 'Beta',  '110', 'B'),
 ('CS-101', '1', 'Spring', 2026, 'Alpha', '101', 'A'),
 ('CS-201', '1', 'Spring', 2026, 'Alpha', '205', 'C'),
 ('CS-301', '1', 'Fall',   2026, 'Alpha', '205', 'D'),
 ('CS-315', '1', 'Spring', 2026, 'Beta',  '220', 'B'),
 ('CS-315', '1', 'Fall',   2026, 'Beta',  '220', 'B'),
 ('CS-347', '1', 'Fall',   2026, 'Gamma', '301', 'E'),
 ('MA-101', '1', 'Fall',   2025, 'Beta',  '110', 'C'),
 ('MA-201', '1', 'Spring', 2026, 'Beta',  '220', 'D'),
 ('MA-210', '1', 'Fall',   2025, 'Beta',  '220', 'A'),
 ('PH-101', '1', 'Fall',   2025, 'Gamma', '302', 'B'),
 ('PH-201', '1', 'Spring', 2026, 'Gamma', '302', 'C'),
 ('BI-101', '1', 'Fall',   2025, 'Gamma', '301', 'D'),
 ('BI-230', '1', 'Fall',   2026, 'Gamma', '301', 'A'),
 ('EC-101', '1', 'Spring', 2026, 'Beta',  '110', 'E'),
 ('EC-220', '1', 'Fall',   2026, 'Beta',  '110', 'C');

insert into teaches values
 ('I1001', 'CS-101', '1', 'Fall',   2025),
 ('I1003', 'CS-101', '2', 'Fall',   2025),
 ('I1003', 'CS-101', '1', 'Spring', 2026),
 ('I1002', 'CS-201', '1', 'Spring', 2026),
 ('I1001', 'CS-301', '1', 'Fall',   2026),
 ('I1001', 'CS-315', '1', 'Spring', 2026),
 ('I1002', 'CS-315', '1', 'Fall',   2026),
 ('I1001', 'CS-347', '1', 'Fall',   2026),
 ('I2001', 'MA-101', '1', 'Fall',   2025),
 ('I2002', 'MA-201', '1', 'Spring', 2026),
 ('I2001', 'MA-210', '1', 'Fall',   2025),
 ('I3001', 'PH-101', '1', 'Fall',   2025),
 ('I3002', 'PH-201', '1', 'Spring', 2026),
 ('I4001', 'BI-101', '1', 'Fall',   2025),
 ('I4001', 'BI-230', '1', 'Fall',   2026),
 ('I9000', 'BI-230', '1', 'Fall',   2026),
 ('I5001', 'EC-101', '1', 'Spring', 2026),
 ('I5002', 'EC-220', '1', 'Fall',   2026);

insert into student values
 ('S0001', 'An',    'Comp. Sci.', 32), ('S0002', 'Binh',  'Comp. Sci.', 18),
 ('S0003', 'Chau',  'Comp. Sci.', 7),  ('S0004', 'Dung',  'Comp. Sci.', 0),
 ('S0005', 'Giang', 'Mathematics', 24), ('S0006', 'Ha',   'Mathematics', 10),
 ('S0007', 'Khanh', 'Physics', 21),    ('S0008', 'Lan',   'Physics', 8),
 ('S0009', 'Minh',  'Biology', 14),    ('S0010', 'Nam',   'Biology', 3),
 ('S0011', 'Oanh',  'Economics', 16),  ('S0012', 'Phuc',  'Economics', 6),
 ('S0013', 'Quang', 'Comp. Sci.', 40), ('S0014', 'Son',   'Mathematics', 12),
 ('S0015', 'Thao',  'Comp. Sci.', 11), ('S0016', 'Uyen',  'Physics', 4),
 ('S0017', 'Viet',  'Comp. Sci.', 22), ('S0018', 'Xuan',  'Economics', 9),
 ('S0019', 'Yen',   'Biology', 0),     ('S0020', 'Bao',   'Comp. Sci.', 0);

insert into advisor values
 ('S0001', 'I1001'), ('S0002', 'I1001'), ('S0003', 'I1002'), ('S0004', 'I1003'),
 ('S0005', 'I2001'), ('S0006', 'I2002'), ('S0007', 'I3001'), ('S0008', 'I3002'),
 ('S0009', 'I4001'), ('S0010', 'I4001'), ('S0011', 'I5001'), ('S0012', 'I5002'),
 ('S0013', 'I1002'), ('S0014', 'I2001'), ('S0015', 'I1003'), ('S0016', 'I3001'),
 ('S0017', 'I1001'), ('S0018', 'I5001'), ('S0019', 'I4001');

insert into takes values
 ('S0001', 'CS-101', '1', 'Fall',   2025, 'A'),
 ('S0001', 'MA-210', '1', 'Fall',   2025, 'A-'),
 ('S0001', 'CS-201', '1', 'Spring', 2026, 'A'),
 ('S0001', 'CS-315', '1', 'Spring', 2026, 'B+'),
 ('S0001', 'CS-301', '1', 'Fall',   2026, null),
 ('S0001', 'CS-347', '1', 'Fall',   2026, null),
 ('S0002', 'CS-101', '2', 'Fall',   2025, 'B'),
 ('S0002', 'CS-201', '1', 'Spring', 2026, 'C'),
 ('S0002', 'CS-315', '1', 'Fall',   2026, null),
 ('S0003', 'CS-101', '1', 'Spring', 2026, 'B-'),
 ('S0003', 'MA-101', '1', 'Fall',   2025, 'F'),
 ('S0005', 'MA-101', '1', 'Fall',   2025, 'A'),
 ('S0005', 'MA-210', '1', 'Fall',   2025, 'B+'),
 ('S0005', 'MA-201', '1', 'Spring', 2026, 'A-'),
 ('S0005', 'CS-101', '1', 'Spring', 2026, 'A'),
 ('S0006', 'MA-101', '1', 'Fall',   2025, 'C+'),
 ('S0006', 'MA-201', '1', 'Spring', 2026, 'B'),
 ('S0007', 'PH-101', '1', 'Fall',   2025, 'A'),
 ('S0007', 'MA-101', '1', 'Fall',   2025, 'B+'),
 ('S0007', 'PH-201', '1', 'Spring', 2026, 'A-'),
 ('S0008', 'PH-101', '1', 'Fall',   2025, 'C'),
 ('S0008', 'PH-201', '1', 'Spring', 2026, 'F'),
 ('S0009', 'BI-101', '1', 'Fall',   2025, 'B'),
 ('S0009', 'CS-101', '2', 'Fall',   2025, 'B+'),
 ('S0009', 'BI-230', '1', 'Fall',   2026, null),
 ('S0010', 'BI-101', '1', 'Fall',   2025, 'C-'),
 ('S0011', 'EC-101', '1', 'Spring', 2026, 'A'),
 ('S0011', 'MA-101', '1', 'Fall',   2025, 'B'),
 ('S0011', 'EC-220', '1', 'Fall',   2026, null),
 ('S0012', 'EC-101', '1', 'Spring', 2026, 'B-'),
 ('S0013', 'CS-101', '1', 'Fall',   2025, 'A'),
 ('S0013', 'CS-201', '1', 'Spring', 2026, 'A'),
 ('S0013', 'CS-315', '1', 'Spring', 2026, 'A'),
 ('S0013', 'MA-210', '1', 'Fall',   2025, 'A'),
 ('S0013', 'CS-301', '1', 'Fall',   2026, null),
 ('S0013', 'CS-347', '1', 'Fall',   2026, null),
 ('S0014', 'MA-101', '1', 'Fall',   2025, 'B'),
 ('S0014', 'MA-210', '1', 'Fall',   2025, 'C'),
 ('S0015', 'CS-101', '2', 'Fall',   2025, 'B'),
 ('S0015', 'MA-101', '1', 'Fall',   2025, 'B-'),
 ('S0016', 'PH-101', '1', 'Fall',   2025, 'C+'),
 ('S0017', 'CS-101', '1', 'Fall',   2025, 'A-'),
 ('S0017', 'CS-201', '1', 'Spring', 2026, 'B+'),
 ('S0017', 'MA-210', '1', 'Fall',   2025, 'B'),
 ('S0017', 'CS-315', '1', 'Fall',   2026, null),
 ('S0018', 'EC-101', '1', 'Spring', 2026, 'C'),
 ('S0020', 'CS-101', '1', 'Spring', 2026, 'A-');
go

print 'University database created.';
go

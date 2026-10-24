/* IDB201 Lab 2 - sample solution (lecturer copy). Database: University. */
use University;
go
-- A1: new tables
drop table if exists membership; drop table if exists club;
create table club (
    club_id   int identity(1,1) primary key,
    name      varchar(40) not null unique,
    dept_name varchar(20) null references department (dept_name) on delete set null,
    founded   date not null default (cast(sysdatetime() as date)),
    max_size  int not null check (max_size between 5 and 200)
);
create table membership (
    ID      varchar(5)  not null references student (ID) on delete cascade,
    club_id int         not null references club (club_id) on delete cascade,
    role    varchar(10) not null default 'member'
            check (role in ('member', 'secretary', 'president')),
    joined  date        not null,
    primary key (ID, club_id)
);
go
insert into club (name, dept_name, max_size) values ('Database Reading Group', 'Comp. Sci.', 20);
insert into membership values ('S0001', 1, 'president', '2026-09-10');
go
-- A2: one violation per constraint (each statement fails)
insert into membership values ('S0001', 1, 'member', '2026-09-11');           -- PK
go
insert into membership values ('S9999', 1, 'member', '2026-09-11');           -- FK
go
insert into membership values ('S0002', 1, 'treasurer', '2026-09-11');        -- check
go
insert into club (name, dept_name, max_size) values ('Database Reading Group', null, 10); -- unique
go
insert into membership (ID, club_id, role) values ('S0002', 1, 'member');    -- not null (joined)
go
-- A3: views
create or alter view cs_students as
    select ID, name, dept_name, tot_cred from student where dept_name = 'Comp. Sci.'
    with check option;
go
create or alter view dept_size as
    select dept_name, count(*) as n from student group by dept_name;
go
insert into cs_students values ('S0100', 'Test', 'Physics', 0);   -- fails: check option
go
insert into cs_students values ('S0100', 'Test', 'Comp. Sci.', 0); -- succeeds
go
update dept_size set n = 0 where dept_name = 'Physics';             -- fails: aggregate view
go
delete from student where ID = 'S0100';
go
-- A4: cascades
begin transaction;
delete from course where course_id = 'CS-499';   -- succeeds: no sections, not a prerequisite
delete from course where course_id = 'CS-347';   -- succeeds: cascades to section, teaches, takes, prereq(course_id)
select (select count(*) from section where course_id = 'CS-347') as sections_left,
       (select count(*) from takes   where course_id = 'CS-347') as takes_left;
rollback transaction;
go
begin transaction;
delete from course where course_id = 'CS-101';   -- fails: referenced by prereq.prereq_id (no action)
rollback transaction;
go
-- Investigate: SQL injection
declare @name varchar(100) = 'X'' or ''1''=''1';
declare @sql nvarchar(400) = N'select ID, name from student where name = ''' + @name + N'''';
print @sql;
exec (@sql);                                       -- returns every student
exec sp_executesql N'select ID, name from student where name = @n',
                   N'@n varchar(100)', @n = @name; -- returns no row
go
declare @name varchar(100) = 'O''Brien';
declare @sql nvarchar(400) = N'select ID, name from student where name = ''' + @name + N'''';
exec (@sql);                                       -- syntax error
go
drop view if exists cs_students; drop view if exists dept_size;
drop table if exists membership; drop table if exists club;

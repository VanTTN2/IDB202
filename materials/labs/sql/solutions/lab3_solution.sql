/* IDB201 Lab 3 - sample solution (lecturer copy). Database: University. */
use University;
go
-- Part 1.1 scalar function
create or alter function dbo.grade_points (@grade varchar(2))
returns numeric(3,1)
as
begin
    return case @grade
        when 'A' then 4.0 when 'A-' then 3.7 when 'B+' then 3.3 when 'B' then 3.0
        when 'B-' then 2.7 when 'C+' then 2.3 when 'C' then 2.0 when 'C-' then 1.7
        when 'F' then 0.0 else null end;
end;
go
-- Part 1.2 table-valued function
create or alter function dbo.transcript (@ID varchar(5))
returns table
as
return (
    select t.course_id, c.title, t.semester, t.year, c.credits, t.grade,
           dbo.grade_points(t.grade) as points
    from   takes t join course c on c.course_id = t.course_id
    where  t.ID = @ID
);
go
select * from dbo.transcript('S0001') order by year, semester;
select ID, sum(dbo.grade_points(grade) * c.credits) / sum(c.credits) as gpa
from   takes t join course c on c.course_id = t.course_id
where  dbo.grade_points(grade) is not null
group by ID having ID in ('S0001', 'S0003');
go
-- Part 1.3 stored procedure
create or alter procedure dbo.register_student
    @ID varchar(5), @course_id varchar(8), @sec_id varchar(8),
    @semester varchar(6), @year numeric(4,0)
as
begin
    set nocount on;
    begin try
        begin transaction;
        if not exists (select * from student where ID = @ID)
            throw 50001, 'Unknown student.', 1;
        if not exists (select * from section where course_id = @course_id and sec_id = @sec_id
                       and semester = @semester and year = @year)
            throw 50002, 'Unknown section.', 1;
        if exists (select * from takes where ID = @ID and course_id = @course_id
                   and sec_id = @sec_id and semester = @semester and year = @year)
            throw 50003, 'Already registered.', 1;
        if exists (select p.prereq_id from prereq p where p.course_id = @course_id
                   and not exists (select * from takes t where t.ID = @ID
                                   and t.course_id = p.prereq_id
                                   and t.grade is not null and t.grade <> 'F'))
            throw 50004, 'Prerequisite not satisfied.', 1;
        if (select count(*) from takes where course_id = @course_id and sec_id = @sec_id
            and semester = @semester and year = @year)
           >= (select r.capacity from section s join classroom r
               on r.building = s.building and r.room_number = s.room_number
               where s.course_id = @course_id and s.sec_id = @sec_id
               and s.semester = @semester and s.year = @year)
            throw 50005, 'Section is full.', 1;
        insert into takes values (@ID, @course_id, @sec_id, @semester, @year, null);
        commit transaction;
    end try
    begin catch
        if @@trancount > 0 rollback transaction;
        throw;
    end catch
end;
go
exec dbo.register_student 'S0003', 'CS-201', '1', 'Spring', 2026;   -- ok (CS-101 passed)
go
exec dbo.register_student 'S0003', 'CS-201', '1', 'Spring', 2026;   -- 50003
go
exec dbo.register_student 'S0004', 'CS-315', '1', 'Fall', 2026;     -- 50004
go
delete from takes where ID = 'S0003' and course_id = 'CS-201';
go
-- Part 2.1 trigger maintaining tot_cred
create or alter trigger dbo.credits_earned on takes
after update
as
begin
    set nocount on;
    update s
    set    tot_cred = s.tot_cred + x.earned
    from   student s
    join  (select i.ID, sum(c.credits) as earned
           from   inserted i
           join   deleted d on d.ID = i.ID and d.course_id = i.course_id and d.sec_id = i.sec_id
                           and d.semester = i.semester and d.year = i.year
           join   course c on c.course_id = i.course_id
           where  i.grade is not null and i.grade <> 'F'
             and (d.grade is null or d.grade = 'F')
           group by i.ID) x on x.ID = s.ID;
end;
go
select ID, tot_cred from student where ID in ('S0001', 'S0013');
update takes set grade = 'A' where course_id = 'CS-347' and semester = 'Fall' and year = 2026;
select ID, tot_cred from student where ID in ('S0001', 'S0013');   -- each + 3
update takes set grade = null where course_id = 'CS-347' and semester = 'Fall' and year = 2026;
update student set tot_cred = tot_cred - 3 where ID in ('S0001', 'S0013');
go
-- Part 2.2 audit trigger
drop table if exists salary_audit;
create table salary_audit (
    audit_id   int identity primary key,
    ID         varchar(5) not null,
    old_salary numeric(8,2) null,
    new_salary numeric(8,2) null,
    changed_by sysname not null default suser_sname(),
    changed_at datetime2 not null default sysdatetime()
);
go
create or alter trigger dbo.salary_audit_trg on instructor
after update
as
begin
    set nocount on;
    if update(salary)
        insert into salary_audit (ID, old_salary, new_salary)
        select i.ID, d.salary, i.salary
        from   inserted i join deleted d on d.ID = i.ID
        where  i.salary <> d.salary
           or (i.salary is null and d.salary is not null)
           or (i.salary is not null and d.salary is null);
end;
go
begin transaction;
update instructor set salary = salary * 1.05 where dept_name = 'Physics';
update instructor set salary = 50000 where ID = 'I9000';
select ID, old_salary, new_salary from salary_audit order by audit_id;
rollback transaction;
go
-- Investigate: cursor versus set-based (run lab3_scale.sql first)
declare @t0 datetime2 = sysdatetime();
declare @id int, @c int;
declare cur cursor local fast_forward for select ID from stu_x;
open cur;
fetch next from cur into @id;
while @@fetch_status = 0
begin
    select @c = coalesce(sum(credits), 0) from takes_x
    where  ID = @id and grade is not null and grade <> 'F';
    update stu_x set tot_cred = @c where ID = @id;
    fetch next from cur into @id;
end;
close cur; deallocate cur;
declare @t1 datetime2 = sysdatetime();
update s set tot_cred = coalesce(x.c, 0)
from   stu_x s
left join (select ID, sum(credits) as c from takes_x
           where grade is not null and grade <> 'F' group by ID) x on x.ID = s.ID;
declare @t2 datetime2 = sysdatetime();
select datediff(millisecond, @t0, @t1) as cursor_ms, datediff(millisecond, @t1, @t2) as set_based_ms;
go

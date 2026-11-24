/* IDB201 Lab 1 - sample solution (lecturer copy). Database: University. */
use University;
go
-- A1
select name, dept_name, salary from instructor where salary > 80000 order by salary desc;
-- A2
select s.course_id, s.sec_id, c.title, i.name
from   section s
join   course c   on c.course_id = s.course_id
join   teaches t  on t.course_id = s.course_id and t.sec_id = s.sec_id
                 and t.semester = s.semester and t.year = s.year
join   instructor i on i.ID = t.ID
where  s.semester = 'Fall' and s.year = 2025
order by s.course_id, s.sec_id;
-- A3
select st.ID, st.name, tk.course_id, tk.semester, tk.year
from   student st left outer join takes tk on st.ID = tk.ID
order by st.ID;
-- A4
select ID, name from instructor where salary = null;   -- no rows
select ID, name from instructor where salary is null;  -- I9000
-- A5
select count(*) as all_rows, count(grade) as graded, count(*) - count(grade) as null_grades from takes;
-- B1
select dept_name, avg(salary) as avg_salary
from   instructor group by dept_name having avg(salary) > 70000;
-- B2
select d.dept_name, count(s.ID) as n_students
from   department d left outer join student s on s.dept_name = d.dept_name
group by d.dept_name order by d.dept_name;
-- B3
select course_id from section where semester = 'Fall' and year = 2025
union
select course_id from section where semester = 'Spring' and year = 2026;
select course_id from section where semester = 'Fall' and year = 2025
intersect
select course_id from section where semester = 'Spring' and year = 2026;
select course_id from section where semester = 'Fall' and year = 2025
except
select course_id from section where semester = 'Spring' and year = 2026;
-- B4 (division)
select s.ID, s.name
from   student s
where  not exists (select c.course_id from course c where c.dept_name = 'Mathematics'
                   except
                   select t.course_id from takes t where t.ID = s.ID);
-- Investigate: three formulations
select name, salary from instructor
where  salary > all (select salary from instructor where dept_name = 'Biology');
select name, salary from instructor
where  salary > (select max(salary) from instructor where dept_name = 'Biology');
select i.name, i.salary from instructor i
where  not exists (select * from instructor b
                   where b.dept_name = 'Biology' and b.salary >= i.salary);
